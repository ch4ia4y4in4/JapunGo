function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

    if (arr = document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
} 
var food_data=['涼麵','大腸麵線','豆漿店','鹹酥雞','飯糰','壽司','滷肉飯','控肉飯','拉麵','義大利麵','排餐','牛肉麵','披薩','魚湯','廣東粥','炒飯、炒麵','河粉','水餃','漢堡','鹽水雞','滷味','韓式拌飯','自助餐','燒臘','鐵板燒','燒肉','壽喜燒','羊肉爐','定食','丼飯','臭臭鍋','火鍋','便當'];
var q_answer=getCookie('food');
var food=food_data[q_answer];
document.getElementById('q_answer').innerHTML=food;