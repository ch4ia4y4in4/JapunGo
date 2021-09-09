var db=firebase.database();
var qRef=db.ref('問題回報');

var question=document.getElementById('questionTerm');
var email=document.getElementById('emailTerm');
var submit=document.getElementById('submitBtn');


submit.addEventListener('click',function(){
    if(email.value==''||question.value==""){
        alert('問題內容&信箱未填完喔!');
    }else{
        qRef.push({
            'email':email.value,
            'question':question.value
        })
        alert('回報成功');
        setTimeout(() => {
            email.value='';
        question.value='';
        }, 0);
    } 
})