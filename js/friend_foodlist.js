var firebaseConfig = {
    apiKey: "AIzaSyCcIFB1orespqziBWnX8kUWyihopdBw8jM",
    authDomain: "japungo.firebaseapp.com",
    databaseURL: "https://japungo.firebaseio.com",
    projectId: "japungo",
    storageBucket: "japungo.appspot.com",
    messagingSenderId: "238647383425",
    appId: "1:238647383425:web:cd43c3708893b6e052c480"
};
// Initialize Firebase 初始化
firebase.initializeApp(firebaseConfig);
var db = firebase.database();

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}
var User = getCookie('ID');

var friendId = getCookie('friendId');


db.ref('會員資料/').once('value', function (snapshot) {
    let data = snapshot.val();
    for(i in data){
        if(data[i].ID==friendId){
            document.getElementById('title_h1').innerHTML= data[i].Name +'的美食清單';
            
            document.title=  data[i].Name +'的美食清單';
           
        }
    }
})


var start_map;
var map;
var my_lat;
var my_lng;
var currentLocation;
initMap();

function initMap() {
    start_map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 22.8, lng: 120.20 },
        zoom: 10
        //未開啟定位之前的地圖      
    });
    navigator.geolocation.getCurrentPosition(function (position) {
        my_lat = Number(position.coords.latitude);
        my_lng = Number(position.coords.longitude);
        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map = new google.maps.Map(document.getElementById('map'), {
            //定位後的地圖
            center: currentLocation,
            zoom: 14,
            mapTypeControl: false,
            styles: [
                {
                    "featureType": "poi.business",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                }
            ]

        });
        //---------------標記自己的點---------------------------
        var my_image = {
            url: 'img/me.png',
            size: new google.maps.Size(25, 50),
            scaledSize: new google.maps.Size(25, 50)
        }
        var my_marker = new google.maps.Marker({
            position: currentLocation,
            map: map,
            icon: my_image
        });
        my_marker.addListener('click', function () {
            creat_infowindow(currentLocation, my_marker);
        })
    });
    let geocoder = new google.maps.Geocoder();
    let ref = '/美食清單資料/' + friendId;
    db.ref(ref).once('value', function (snapshot) {
        var Name=[];
        var Address=[];
        var Url=[];
        var Phone=[];
        let data = snapshot.val();
        for(i in data){
            Name.push(data[i].Name);
            Address.push(data[i].Address);
            Url.push(data[i].Url);
            Phone.push(data[i].Phone)
        }
        console.log('有抓到清單資料'+Name[0]+Name[1]);
        var infowindow = new google.maps.InfoWindow();
        for (let i = 1; i < Name.length; i++) {  //不能用for (i in data),會只抓最後一筆資料
            geocoder.geocode({ 'address': Address[i] }, function (results, status) {
                if (status == 'OK') {
                    map.setCenter(results[0].geometry.location);
                    let maker_img = {
                        url: 'img/restaurant.png',
                        size: new google.maps.Size(30, 45),
                        scaledSize: new google.maps.Size(30, 45)
                    }
                    var marker = new google.maps.Marker({
                        map: map,
                        icon: maker_img,
                        position: results[0].geometry.location,
                        restaurant: Name[i],
                        address: Address[i],
                        intro: Url[i],
                        phone: Phone[i]
                        //icon:地標圖案圖片網址

                    });
                    marker.addListener('click', function () {
                        infowindow.setContent('<div class="info_map" id="info_map"><ul>' +
                            '<li>餐廳： ' + Name[i] + '</li>' +
                            '<li>地址： </br>' + Address[i] + '</li>' +
                            '<li>電話： ' + Phone[i] + '</li></ul>' +
                            '<button id="viewMore" >查看更多</button></div>');

                        infowindow.open(map, this);
                        setTimeout(() => {
                            test(Name[i],Address[i],Phone[i],Url[i]);
                        }, 0);
                    });

                } else {
                    console.log(status);
                }
            });
        }
    })



}  //initMap


function creat_infowindow(position, marker) {
    let infow = new google.maps.InfoWindow({
        content: '我的位置'
    });
    infow.open(map, marker);
}

function test(Name,Address,Phone,Url) { //infowindow點擊後

    document.getElementById('viewMore').addEventListener('click', function () {
        $('.postArea_map').hide();
            $('.commentArea_map').hide();
            $('.btnOption_map').hide();
            $('.allComments_map').hide();
        document.getElementById('info_detail').style.display = "block";
        console.log('收到data' + Name);
        document.getElementById('restaurant').innerHTML = Name;
        document.getElementById('name0').value = Name;
        document.getElementById('r_address').innerHTML = Address;
        document.getElementById('address0').value = Address;
        document.getElementById('r_tel').innerHTML = Phone;
        document.getElementById('phone0').value = Phone;
        if (Url != 0) {
            document.getElementById('map_recommend_a').style.display='block';
            document.getElementById('map_recommend_a').href = Url;
            document.getElementById('map_recommend_a').target = "_blank";
            document.getElementById('url0').value = Url;
        } else {
            document.getElementById('url0').value = 0;
            document.getElementById('map_recommend_a').style.display='none';
        }
        var ref = '/美食清單資料/' + User;
        db.ref(ref).once('value', function (snapshot) {
            var n = 0;
            var mydata = snapshot.val();
            for (i in mydata) {
                if (mydata[i].Name == Name) {
                    n += 1;
                }
            }
            if (n != 0) {
                document.getElementById('favorite0').innerHTML = '自清單移除';
                document.getElementById('favorite0').setAttribute("onclick", "javascript: favorite_delete(0);");  //已加入清單的按鈕
            } else {
                document.getElementById('favorite0').innerHTML = '加入清單';
                document.getElementById('favorite0').setAttribute("onclick", "javascript: favorite(0);");
            }
        })
        //-------抓評論--------
        document.getElementById('allComments0').innerHTML='<div class="allComments_map" id="allComments0">\
        <div class="comments_map" id="original0">\
            <img src="img/pic.png" alt="">\
            <div class="commentContent_map">\
                <p>還沒有人發表評論喔~</p>\
            </div>\
        </div>\
    </div>';
        var allcomment_ref = '/評論區資料';
        db.ref(allcomment_ref).once('value', function (snapshot) {
            
            var allcommentdata = snapshot.val();
            var userid = [];
            var imgid = [];

            var num = 0;
            for (i in allcommentdata) {
                if (allcommentdata[i].Name == Name) {
                    var allComments = '#allComments'+'0';
                    var original = 'original' + '0';
                    var img = 'img' + '0' + '_' + num;
                    var str = '<div class="comments">\
                        <img src="img/pic.png"  id="img'+ '0' + '_' + num + '" alt="">\
                        <div class="commentContent">\
                        <p>'+ allcommentdata[i].Discon + '</p>\
                        </div>\
                        </div>';
                    $(allComments).append(str);
                    userid.push(allcommentdata[i].UNo);
                    imgid.push(img);
                    num += 1;

                    document.getElementById(original).style.display = 'none';
                }
            }


            for (i in userid) {
                getimg(userid[i], imgid[i]);
            }


        })



    })

}


//----清單版本-------------------------------------------------------
var ref = '/美食清單資料/' + friendId;
db.ref(ref).once('value', function (snapshot) {
    let data = snapshot.val();
    var n = 1;
    var list = '';
    for (i in data) {
        var clear = '<div style="clear:both;"></div>';
        var str =
            '<div class="info">\
            <input type="hidden" id="name'+ n + '" value="' + data[i].Name + '">\
            <input type="hidden" id="address'+ n + '" value="' + data[i].Address + '">\
            <input type="hidden" id="phone'+ n + '" value="' + data[i].Phone + '">\
            <input type="hidden" id="url'+ n + '" value="' + data[i].Url + '">\
            <h3>'+ data[i].Name + '</h3>\
            <img src="img/pin.png" class="addIcon">\
            <p class="address">'+ data[i].Address + '</p>\
            <img src="img/tel.png" class="telIcon">\
            <p class="tel">'+ data[i].Phone + '</p>\
            <div class="btn0">\
                <button class="showAllComments" onclick="showallcomment_list('+ n + ')"><img src="img/show_comment.png" class="commentIcon">顯示評論區</button>\
                <a class="recommend" id="recommend_a'+ n + '"><img src="img/best.png" class="bestIcon">查看推薦</a>\
            </div>\
            <div class="btn">\
                <button id="post" onclick="show_post('+ n + ')">發起動態</button>\
                <button id="comment" onclick="my_comment('+ n + ')">我要評論</button>\
                <button  onclick="favorite(\''+ n + '\')" id="favorite' + n + '">加入清單</button>\
                <!-- 已在清單內顯示移除，尚未加入顯示加入 -->\
            </div>\
            <div class="postArea" id="postArea'+ n + '">\
                <div class="postInput">\
                    <input type="text" class="eatTimeTerm"  placeholder="請輸入飯局時間" id="eatTime'+ n + '"/>\
                    <img src="img/pic.png" alt="">\
                    <textarea style="overflow:auto" class="postTerm" placeholder="請輸入動態內容" id="post'+ n + '"></textarea>\
                </div>\
                <div class="btn2">\
                    <button onclick="post_enter(\''+ n + '\')">確定</button>\
                    <button onclick="post_cancel(\''+ n + '\')">取消</button>\
                </div>\
            </div>\
            <div class="commentArea" id="commentArea'+ n + '">\
                <div class="commentInput">\
                    <textarea style="overflow:auto" class="commentTerm" placeholder="請輸入評論內容" id="comment'+ n + '"></textarea>\
                    <img src="img/pic.png" alt="">\
                </div>\
                <div class="btn3">\
                    <button id="option" onclick="show_option('+ n + ')">評論選項</button>\
                    <button onclick="comment_enter(\''+ n + '\')">我要評論</button>\
                </div>\
                <div class="btnOption" id="btnOption'+ n + '">\
                    <button onclick="opt1(\''+ n + '\')">環境乾淨</button>\
                    <button onclick="opt2(\''+ n + '\')">環境骯髒</button>\
                    <button onclick="opt3(\''+ n + '\')">餐點美味</button>\
                    <button onclick="opt4(\''+ n + '\')">餐點糟糕</button>\
                    <button onclick="opt5(\''+ n + '\')">親切店家</button>\
                    <button onclick="opt6(\''+ n + '\')">服務極差</button>\
                </div>\
            </div>\
            <div class="allComments" id="allComments'+ n + '">\
                <div class="comments" id="original'+ n + '">\
                    <img src="img/pic.png" alt="">\
                    <div class="commentContent">\
                        <p>還沒有人發表評論喔~</p>\
                    </div>\
                </div>\
            </div>\
        </div>';
        list += str;
        if (n % 2 == 0) {
            list += clear;
        }
        n += 1;
    }
    document.getElementById('list').innerHTML = list;
    //抓取評論資料
    setTimeout(() => {
        var allcomment_ref = '/評論區資料';
        db.ref(allcomment_ref).once('value', function (snapshot) {
            var q = 1;
            var alldata = snapshot.val();
            var userid = [];
            var imgid = [];
            for (j in data) {
                var num = 0;
                for (i in alldata) {
                    if (alldata[i].Name == data[j].Name) {
                        var allComments = '#allComments' + q;
                        var original = 'original' + q;
                        var img = 'img' + q + '_' + num;
                        var str = '<div class="comments">\
                        <img src="img/pic.png"  id="img'+ q + '_' + num + '" alt="">\
                        <div class="commentContent">\
                        <p>'+ alldata[i].Discon + '</p>\
                        </div>\
                        </div>';
                        $(allComments).append(str);
                        userid.push(alldata[i].UNo);
                        imgid.push(img);
                        num += 1;

                        document.getElementById(original).style.display = 'none';
                    }
                }
                q += 1;
            }
            for (i in userid) {
                getimg(userid[i], imgid[i]);
            }


        })

        //判斷有沒有加入美食清單
        var favorite_ref = '/美食清單資料/' + User;
        db.ref(favorite_ref).once('value', function (snapshot) {
            var n = 1;
            var mydata = snapshot.val();
            for (j in data) {
                for (i in mydata) {
                    if (mydata[i].Name == data[j].Name) {
                        var f_id = 'favorite' + n;
                        document.getElementById(f_id).innerHTML = '自清單移除';
                        document.getElementById(f_id).setAttribute("onclick", "javascript: favorite_delete(" + n + ");");  //已加入清單的按鈕  
                    }
                }
                n += 1;
            }
        })
        //判斷有沒有網址
        //判斷有沒有加清單也要寫在這裡
        var m = 1;
        for (i in data) {
            if (data[i].Url != 0) {
                var a_id = 'recommend_a' + m;
                document.getElementById(a_id).href = data[i].Url;
                document.getElementById(a_id).target = "_blank";
            }
            if(data[i].Url == 0){
                var a_id = 'recommend_a' + m;
                document.getElementById(a_id).style.display='none';
            }
            m += 1;
        }
        //讓所有DIV一開始都收起來
        $('.commentArea').hide();
        $('.postArea').hide();
        $('.allComments').hide();
        $('.btnOption').hide();
    }, 0);
})

function getimg(user, imgid) {
    var img_id = imgid;
    var storageRef = firebase.storage().ref();
    var img_ref = 'user/' + user;
    var pathReference = storageRef.child(img_ref);
    pathReference.getDownloadURL().then(function (url) {
        document.getElementById(img_id).src = url;
    });
}

//--------排版DIV收縮------------------------------------------------------
function showallcomment_list(i) {
    var allComments = '#allComments' + i;
    var postArea = '#postArea' + i;
    var commentArea = '#commentArea' + i;
    $(allComments).slideToggle();
    $(postArea).hide();
    $(commentArea).hide();

}
function show_post(i) {
    var allComments = '#allComments' + i;
    var postArea = '#postArea' + i;
    var commentArea = '#commentArea' + i;
    $(postArea).slideToggle();
    $(commentArea).hide();
    $(allComments).hide();

}
function my_comment(i) {
    var allComments = '#allComments' + i;
    var postArea = '#postArea' + i;
    var commentArea = '#commentArea' + i;
    $(commentArea).slideToggle();
    $(postArea).hide();
    $(allComments).hide();
}
function show_option(i) {
    var btnOption = '#btnOption' + i;
    $(btnOption).slideToggle();
}

//-------------以下店家資訊裡面的按鈕功能-----------------------------------

//----發起動態---------
function post_enter(i) { //發起動態 確定
    var id = 'post' + i;
    var eatTime_id = 'eatTime' + i;
    var eatTime = document.getElementById(eatTime_id).value;
    var content = document.getElementById(id).value;  //取得動態內容
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var phone_id = 'phone' + i;
    var phone = document.getElementById(phone_id).value;
    var date = new Date();
    var today = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    var joinKey = User + date.getTime();
    let ref = '/動態資料';
    db.ref(ref).push({
        UNo: User,
        Name: name,
        Address: address,
        Phone: phone,
        Date: today,
        Content: content,
        EatTime: eatTime,
        JoinKey: joinKey
    });
    setTimeout(() => {
        document.getElementById(id).value = '';
        document.getElementById(eatTime_id).value = ''
        document.getElementById(id).placeholder = today + "動態發佈成功!!";
    }, 0);



}
function post_cancel(i) { //發起動態 取消
    var id = 'post' + i;
    var content = document.getElementById(id);
    content.value = '';

}

//----我要評論---------
function comment_enter(i) {
    var original='original'+i;
    var allComments = '#allComments' + i;
    var id = 'comment' + i;
    var content = document.getElementById(id).value; //取得評論內容
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var date = new Date();
    var today = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    var ref = '/評論區資料';
    db.ref(ref).push({
        UNo: User,
        Name: name,
        Address: address,
        Date: today,
        Discon: content

    });
    console.log(User + '已評論成功! 日期:' + today);
    setTimeout(() => {
        document.getElementById(original).style.display = 'none';
        document.getElementById(id).value = '';
        document.getElementById(id).placeholder = today + "評論成功!";

        var img_ref = 'user/' + User;       //圖片的路徑
        var pathReference = firebase.storage().ref().child(img_ref);
        pathReference.getDownloadURL().then(function (url) {  //將路徑轉換為可使用的URL
            var str = '<div class="comments">\
            <img src="'+ url + '" alt="">\
            <div class="commentContent">\
                <p>'+ content + '</p>\
            </div>\
        </div>';
            $(allComments).prepend(str);
        })

    }, 0);


}
function opt1(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 環境乾淨 ';
    document.getElementById(id).value = content;
}
function opt2(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 環境骯髒 ';
    document.getElementById(id).value = content;
}
function opt3(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 餐點美味 ';
    document.getElementById(id).value = content;
}
function opt4(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 餐點糟糕 ';
    document.getElementById(id).value = content;
}
function opt5(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 親切店家 ';
    document.getElementById(id).value = content;
}
function opt6(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 服務極差 ';
    document.getElementById(id).value = content;
}

//----加入清單---------
function favorite(i) {
    var favorite = 'favorite' + i;
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var phone_id = 'phone' + i;
    var phone = document.getElementById(phone_id).value;
    var url_id = 'url' + i;
    var url = document.getElementById(url_id).value;
    var user_ref = '/美食清單資料/' + User;
    db.ref(user_ref).push({
        UNo: User,
        Name: name,
        Address: address,
        Phone: phone,
        Url: url
    });
    console.log('加入清單ㄌ');

    //---將按鈕改成自清單移除-----
    setTimeout(() => {
        document.getElementById(favorite).innerHTML = '自清單移除';
        document.getElementById(favorite).setAttribute("onclick", "javascript: favorite_delete('" + i + "');");
    }, 0);
}
function favorite_delete(i) {
    var favorite = 'favorite' + i;
    var name_id = 'name' + i;
    var name = document.getElementById(name_id).value;
    var address_id = 'address' + i;
    var address = document.getElementById(address_id).value;
    var user_ref = '/美食清單資料/' + User;
    db.ref(user_ref).once('value', function (snapshot) {
        var data = snapshot.val();
        for (i in data) {
            if (data[i].Name == name && data[i].Address == address) {
                db.ref(user_ref).child(i).remove();
            }
        }
    })
    setTimeout(() => {
        document.getElementById(favorite).setAttribute("onclick", "javascript: favorite('" + i + "');");
        document.getElementById(favorite).innerHTML = '加入清單';
    }, 0);

}