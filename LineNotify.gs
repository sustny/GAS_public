//
// LineNotify.gs
// Created on 2017-06-09 00:40
// Created by sustny
//
// Referenced: http://qiita.com/tadaken3/items/5f916a12587e42ece814
//

var sheet = SpreadsheetApp.getActive().getSheetByName('入力');
var token = "*** トークンID ***";

function sendLine(message){
  var options =
   {
     "method"  : "post",
     "payload" : "message=" + message,
     "headers" : {"Authorization" : "Bearer "+ token}

   };

   UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
}

function getEventDate(){
  var today = new Date();
  today = Utilities.formatDate( today, 'Asia/Tokyo', 'yyyy/MM/dd');
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() + 1);
  yesterday = Utilities.formatDate( yesterday, 'Asia/Tokyo', 'yyyy/MM/dd');
  
  var dat = sheet.getDataRange().getValues(); //[Row(行): 1,2,3,...][Column(列): 0,1,2,...]
  //判定列(B)に1が入っている行を探す
  //(1が入っているところが最初のイベントの行というクソスプレッドシートを書いてしまったが、そっちを直すのがめんどいのでこっちが合わせていく)
  for(var i=1;i<dat.length;i++){
    if(dat[i][1] === 1){
      var start = i; //start = dat[i][1]に1が入っていることが分かった
      i = dat.length; //forが終わる条件にして強制終了
    }
  }
  
  //最初のイベント行が分かった所で、さっそくLINEに予定を書き込んでいこうや
  var day, name, place, m_time, m_place, message; //日付, イベント名, 場所, 集合時間, 集合場所, LINEに送る文
  
  for(i=0;i<5;i++) {
    if(dat[start+i][1] != "") {
      day = Utilities.formatDate( dat[start+i][0], 'Asia/Tokyo', 'yyyy/MM/dd')
      if(day == today) { //本日のイベント(当日9:00 - GASのトリガーで時間指定する)
        name = dat[start+i][3]
        
        if(dat[start+i][4] == "") {
          place = "(未定)"
        } else {
          place = dat[start+i][4]
        }
        
        if(dat[start+i][5] == "") {
          m_time = "(未定)"
        } else {
          m_time = dat[start+i][5]
        }
        
        if(dat[start+i][6] == "") {
          m_place = "(未定)"
        } else {
          m_place = dat[start+i][6]
        }
        
        message = ""+"\n【本日のイベント情報】" + "\nイベント名: " + name + "\n場所: " + place + "\n\n集合時間: " + m_time + "\n集合場所: " + m_place 
        sendLine(message);
      } else if(day == yesterday) { //明日のイベント(前日18:00)
        name = dat[start+i][3]
        
        if(dat[start+i][4] == "") {
          place = "(未定)"
        } else {
          place = dat[start+i][4]
        }
        
        if(dat[start+i][5] == "") {
          m_time = "(未定)"
        } else {
          m_time = dat[start+i][5]
        }
        
        if(dat[start+i][6] == "") {
          m_place = "(未定)"
        } else {
          m_place = dat[start+i][6]
        }
        
        message = ""+"\n【明日のイベント情報】" + "\nイベント名: " + name + "\n場所: " + place + "\n\n集合時間: " + m_time + "\n集合場所: " + m_place 
        sendLine(message);
      }
    }
  }
}
