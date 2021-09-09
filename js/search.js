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

var start_map;
var map;
var my_lat;
var my_lng;
var currentLocation;
var mylocation;
var marker_count = [];
var list_str = "";
var User = getCookie('ID');

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

var clear = [];

initMap();



//用Text Search來搜尋使用者輸入的關鍵字
//https://developers.google.com/maps/documentation/javascript/places?hl=zh-TW#TextSearchRequests

function initMap() {
    start_map = new google.maps.Map(document.getElementById('map'), { //畫起始地圖
        center: { lat: 22.8, lng: 120.20 },
        zoom: 10
    });
    navigator.geolocation.getCurrentPosition(function (position) { //定位
        my_lat = Number(position.coords.latitude);
        my_lng = Number(position.coords.longitude);
        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        mylocation = new google.maps.LatLng(my_lat, my_lng);
        map = new google.maps.Map(document.getElementById('map'), { //定位地圖
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
        };
        var my_marker = new google.maps.Marker({
            position: currentLocation,
            map: map,
            icon: my_image
        });
        my_marker.addListener('click', function () {
            creat_infowindow(currentLocation, my_marker);
        })
    });

    //------------用地址查詢--------------
    //let geocoder = new google.maps.Geocoder();
    var service;
    let button = document.getElementById('searchBtn');


    button.addEventListener('click', function () {
        document.getElementById('allList').value='';
        var food = document.getElementById('food').value;
        document.getElementById('input_food').innerHTML = food;
        document.getElementById('line').style.display = "block";
        document.getElementById('list').innerHTML = '';
        for (var i = 0; i < marker_count.length; i++) {
            marker_count[i].setMap(null);
        }


        var request = {
            location: currentLocation,   //搜尋的中心 自身定位
            radius: '500', //公尺
            query: food,
            types: 'restaurant'
        };
        service = new google.maps.places.PlacesService(map);

        service.textSearch(request, callback);




    })





}

function callback(results, status) {
    var resultCount = 0;

    if (status == google.maps.places.PlacesServiceStatus.OK) {

        for (var i = 0; i < results.length; i++) {
            if (google.maps.geometry.spherical.computeDistanceBetween(results[i].geometry.location, mylocation) < 3000) {  //篩選3公里內餐廳
                for (n in results[i].types) {
                    if (results[i].types[n] == 'restaurant') {

                        var request2 = {
                            placeId: results[i].place_id,
                        };
                        service = new google.maps.places.PlacesService(map);
                        if (resultCount % 2 == 1) {
                            service.getDetails(request2, callback2);
                            // $("#list").append('<div style="clear:both;"></div>');

                        } else {
                            service.getDetails(request2, callback2);  //取得餐廳詳細資料並標記
                        }

                        resultCount++;

                    }
                }

            }
        }
        if (resultCount == 0) {
            document.getElementById('list').innerHTML = '<h2 class="inputItem" >範圍裡找不到符合餐廳</h2>';
        }

    }

}


function callback2(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarker(place);
        var ref = '/美食清單資料/' + User;
        db.ref(ref).once('value', function (snapshot) {
            var n = 0;
            var mydata = snapshot.val();
            for (i in mydata) {
                if (mydata[i].Name == place.name) {
                    n += 1;
                }
            }
            if (n != 0) {
                creat_list1(place);  //已加入清單的按鈕
            } else {
                creat_list2(place);
            }
        })
    }
}


function creat_list1(data) {
    var n = 'n' + data.id;
    var allList = document.getElementById("allList").value;
    var str = allList + '<div class="info">\
    <input type="hidden" id="name'+ n + '" value="' + data.name + '">\
    <input type="hidden" id="address'+ n + '" value="' + data.formatted_address + '">\
    <input type="hidden" id="phone'+ n + '" value="' + data.formatted_phone_number + '">\
    <h3>'+ data.name + '</h3>\
    <img src="img/pin.png" class="addIcon">\
    <p class="address">'+ data.formatted_address + '</p>\
    <img src="img/tel.png" class="telIcon">\
    <p class="tel">'+ data.formatted_phone_number + '</p>\
    <div class="btn0">\
        <button class="showAllComments" onclick="showallcomment_list(\''+ n + '\')"><img src="img/show_comment.png" class="commentIcon">顯示評論區</button>\
    </div>\
    <div class="btn">\
        <button id="post" onclick="show_post(\''+ n + '\')">發起動態</button>\
        <button id="comment" onclick="my_comment(\''+ n + '\')">我要評論</button>\
        <button onclick="favorite_delete(\''+ n + '\')" id="favorite' + n + '">自清單移除</button>\
        <!-- 已在清單內顯示移除，尚未加入顯示加入 -->\
    </div>\
    <div class="postArea" id="postArea'+ n + '">\
        <div class="postInput">\
            <input type="text" class="eatTimeTerm"  placeholder="請輸入飯局時間" id="eatTime'+ n + '"/>\
            <img  id="myimg1'+ n + '" src="img/pic.png" alt="">\
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
            <img id="myimg2'+ n + '" src="img/pic.png" alt="">\
        </div>\
        <div class="btn3">\
            <button id="option" onclick="show_option(\''+ n + '\')">評論選項</button>\
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

    clear.push(data.id);
    if (clear.length % 2 == 0) {
        str += '<div style="clear:both;"></div>';
    }
    document.getElementById("allList").value = str;
    document.getElementById('list').innerHTML=str;
   // $("#list").append(str);
    setTimeout(() => {
        //讓所有DIV一開始都收起來
        $('.commentArea').hide();
        $('.postArea').hide();
        $('.allComments').hide();
        $('.btnOption').hide();
        Userimg(User,n);
        //---抓評論資料-----------
        var allcomment_ref = '/評論區資料';
        db.ref(allcomment_ref).once('value', function (snapshot) {
            var q = n;
            var alldata = snapshot.val();
            var userid = [];
            var imgid = [];

            var num = 0;
            for (i in alldata) {
                if (alldata[i].Name == data.name) {
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

            for (i in userid) {
                getimg(userid[i], imgid[i]);
            }


        })
    }, 0);
}
function creat_list2(data) {
    var n = 'n' + data.id;
    var allList = document.getElementById("allList").value;
    var str =allList+ '<div class="info">\
                        <input type="hidden" id="name'+ n + '" value="' + data.name + '">\
                        <input type="hidden" id="address'+ n + '" value="' + data.formatted_address + '">\
                        <input type="hidden" id="phone'+ n + '" value="' + data.formatted_phone_number + '">\
                        <h3>'+ data.name + '</h3>\
                        <img src="img/pin.png" class="addIcon">\
                        <p class="address">'+ data.formatted_address + '</p>\
                        <img src="img/tel.png" class="telIcon">\
                        <p class="tel">'+ data.formatted_phone_number + '</p>\
                        <div class="btn0">\
                            <button class="showAllComments" onclick="showallcomment_list(\''+ n + '\')"><img src="img/show_comment.png" class="commentIcon">顯示評論區</button>\
                            </div>\
                        <div class="btn">\
                            <button id="post" onclick="show_post(\''+ n + '\')">發起動態</button>\
                            <button id="comment" onclick="my_comment(\''+ n + '\')">我要評論</button>\
                            <button onclick="favorite(\''+ n + '\')" id="favorite' + n + '">加入清單</button>\
                            <!-- 已在清單內顯示移除，尚未加入顯示加入 -->\
                        </div>\
                        <div class="postArea" id="postArea'+ n + '">\
                        <div class="postInput">\
                            <input type="text" class="eatTimeTerm"  placeholder="請輸入飯局時間" id="eatTime'+ n + '"/>\
                            <img id="myimg1'+ n + '" src="img/pic.png" alt="">\
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
                            <img id="myimg2'+ n + '" src="img/pic.png" alt="">\
                        </div>\
                        <div class="btn3">\
                            <button id="option" onclick="show_option(\''+ n + '\')">評論選項</button>\
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
    clear.push(data.id);
    if (clear.length % 2 == 0) {
        str += '<div style="clear:both;"></div>';
    }
    document.getElementById("allList").value = str;
    document.getElementById('list').innerHTML=str;
   // $("#list").append(str);
    setTimeout(() => {
        //讓所有DIV一開始都收起來
        $('.commentArea').hide();
        $('.postArea').hide();
        $('.allComments').hide();
        $('.btnOption').hide();
        Userimg(User,n);
        //---抓評論資料-----------
        var allcomment_ref = '/評論區資料';
        db.ref(allcomment_ref).once('value', function (snapshot) {
            var q = n;
            var alldata = snapshot.val();
            var userid = [];
            var imgid = [];

            var num = 0;
            for (i in alldata) {
                if (alldata[i].Name == data.name) {
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

            for (i in userid) {
                getimg(userid[i], imgid[i]);
            }


        })
    }, 0);


}



function createMarker(data) {

    var infowindow = new google.maps.InfoWindow();
    let maker_img = {
        url: 'img/restaurant.png',
        size: new google.maps.Size(30, 45),
        scaledSize: new google.maps.Size(30, 45)
    }
    var marker = new google.maps.Marker({
        map: map,
        icon: maker_img,
        place: {
            placeId: data.place_id,
            location: data.geometry.location
        },
        restaurant: data.name,
        address: data.formatted_address,
        phone: data.formatted_phone_number
    });
    marker_count.push(marker);
    marker.addListener('click', function () {
        typeof infoWindowsOpenCurrently !== 'undefined' && infoWindowsOpenCurrently.close();
        infowindow.setContent('<div class="info_map" id="info_map"><ul>' +
            '<li>餐廳： ' + this.restaurant + '</li>' +
            '<li>地址： </br>' + this.address + '</li>' +
            '<li>電話： ' + this.phone + '</li></ul>' +
            ' <button id="viewMore" >查看更多</button></div>');
        infowindow.open(map, this);
        setTimeout(() => {
            open_info_div(this);
        }, 0);
        infoWindowsOpenCurrently = infowindow;
    });
}


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

function open_info_div(data) { //infowindow點擊後
    Userimg(User, 0);
    document.getElementById('viewMore').addEventListener('click', function () {
        document.getElementById('info_detail').style.display = "block";
        console.log('收到data' + data.restaurant);
        document.getElementById('restaurant').innerHTML = data.restaurant;
        document.getElementById('name0').value = data.restaurant;
        document.getElementById('r_address').innerHTML = data.address;
        document.getElementById('address0').value = data.address;
        document.getElementById('r_tel').innerHTML = data.phone;
        document.getElementById('phone0').value = data.phone;

        var ref = '/美食清單資料/' + User;
        db.ref(ref).once('value', function (snapshot) {
            var n = 0;
            var mydata = snapshot.val();
            for (i in mydata) {
                if (mydata[i].Name == data.restaurant) {
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
        document.getElementById('allComments0').innerHTML = '<div class="allComments_map" id="allComments0">\
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
                if (allcommentdata[i].Name == data.restaurant) {
                    var allComments = '#allComments' + 0;
                    var original = 'original' + 0;
                    var img = 'img' + 0 + '_' + num;
                    var str = '<div class="comments">\
                 <img src="img/pic.png"  id="img'+ 0 + '_' + num + '" alt="">\
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
function comment_enter(i) {
    var original = 'original' + i;
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
    var user_ref = '/美食清單資料/' + User;
    db.ref(user_ref).push({
        UNo: User,
        Name: name,
        Address: address,
        Phone: phone,
        Url: 0
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
