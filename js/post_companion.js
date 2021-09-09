db = firebase.database();
var User=getCookie('ID');
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}
function showallcomment_list(i) {
    var allComments = '#allComments' + i;
    var postArea = '#postArea' + i;
    var commentArea = '#commentArea' + i;
    $(allComments).slideToggle();
    $(postArea).hide();
    $(commentArea).hide();

}

function more(key) {
    var join_ref='/加入飯局資料/'+key;
    db.ref(join_ref).once('value', function (snapshot) {
        var data=snapshot.val();
        var num=0
        for(i in data){
            console.log(data[i]);
        }
        
    })
    console.log('你按的是' + key + '的More');
    var id = '#moreCompanion' + key;
    $(id).slideToggle();
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