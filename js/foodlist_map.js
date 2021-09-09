var db = firebase.database();
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}
var User = getCookie('ID');

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
    let ref = '/美食清單資料/' + User;
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
    Userimg(User, 0);
    document.getElementById('viewMore').addEventListener('click', function () {
        $('.postArea_map').hide();
        $('.commentArea_map').hide();
        $('.btnOption_map').hide();
        $('.allComments_map').hide();
         document.getElementById('info_detail').style.display = "block";

        console.log('收到data' + Name);
        document.getElementById('restaurant').innerHTML = Name;
        document.getElementById('name_map').value = Name;
        document.getElementById('r_address').innerHTML = Address;
        document.getElementById('address_map').value = Address;
        document.getElementById('r_tel').innerHTML = Phone;
        document.getElementById('phone_map').value = Phone;
        if (Url != 0) {
            document.getElementById('map_recommend_a').style.display='block';
            document.getElementById('map_recommend_a').href = Url;
            document.getElementById('map_recommend_a').target = "_blank";
            document.getElementById('url_map').value = Url;
        } else {
            document.getElementById('url_map').value = 0;
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
                document.getElementById('favoritemap').innerHTML = '自清單移除';
                document.getElementById('favoritemap').setAttribute("onclick", "javascript: favorite_delete('map');");  //已加入清單的按鈕
            } else {
                document.getElementById('favoritemap').innerHTML = '加入清單';
                document.getElementById('favoritemap').setAttribute("onclick", "javascript: favorite('map');");
            }
        })
        //-------抓評論--------
        document.getElementById('allCommentsmap').innerHTML='<div class="allComments_map" id="allCommentsmap">\
        <div class="comments_map" id="originalmap">\
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
                    var allComments = '#allComments'+'map';
                    var original = 'original' + 'map';
                    var img = 'img' + 'map' + '_' + num;
                    var str = '<div class="comments">\
                        <img src="img/pic.png"  id="img'+ 'map' + '_' + num + '" alt="">\
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

function getimg(user, imgid) {
    var img_id = imgid;
    var storageRef = firebase.storage().ref();
    var img_ref = 'user/' + user;
    var pathReference = storageRef.child(img_ref);
    pathReference.getDownloadURL().then(function (url) {
        document.getElementById(img_id).src = url;
    });
}
function Userimg(user, i) {
    var img1 = 'myimg1'+i;
    var img2 = 'myimg2'+i;
    var storageRef = firebase.storage().ref();
    var img_ref = 'user/' + user;
    var pathReference = storageRef.child(img_ref);
    pathReference.getDownloadURL().then(function (url) {
        document.getElementById(img1).src = url;
        document.getElementById(img2).src = url;
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
    let joinkey_ref='/加入飯局資料/'+joinKey;
    db.ref(joinkey_ref).set({
        CreatID:User
    })
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
function comment_enterm(i) {
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
function opt1m(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 環境乾淨 ';
    document.getElementById(id).value = content;
}
function opt2m(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 環境骯髒 ';
    document.getElementById(id).value = content;
}
function opt3m(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 餐點美味 ';
    document.getElementById(id).value = content;
}
function opt4m(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 餐點糟糕 ';
    document.getElementById(id).value = content;
}
function opt5m(i) {
    var id = 'comment' + i;
    var content = document.getElementById(id).value;
    content = content + ' 親切店家 ';
    document.getElementById(id).value = content;
}
function opt6m(i) {
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