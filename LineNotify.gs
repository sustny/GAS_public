//
// LineNotify.gs
// Created on 2017-06-11 01:30
// Created by sustny
//
// Referenced: http://qiita.com/tadaken3/items/5f916a12587e42ece814
//

/* ------------------------------ Settings ------------------------------ */
var token = "***トークンID***"; //1対1グループ
//var token = "***トークンID***"; //本番用グループ

var sheet = SpreadsheetApp.getActive().getSheetByName('入力');
var dat = sheet.getDataRange().getValues();
var count = 5; //見に行くイベントの数
var before = 3; //今日明日以外で通知するイベントの通知日(="before"日前に告知する)

/* ------------------------------ Get Date ------------------------------ */
//現在の日付
var today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
//翌日の日付
var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow = Utilities.formatDate(tomorrow, 'Asia/Tokyo', 'yyyy/MM/dd');
//before日後の日付(↑Settingsで指定)
var next = new Date();
next.setDate(next.getDate() + before);
next = Utilities.formatDate(next, 'Asia/Tokyo', 'yyyy/MM/dd');

/* ------------------------------ Memo ------------------------------ */
//dat[i][1-4]...日時
//dat[i][5,6]...イベント名、会場
//dat[i][7-9]...集合時間、集合場所、座標
//dat[i][10-19]...メンバー

function sendLine(message) {
  var options =
    {
      "method"  : "post",
      "payload" : "message=" + message,
      "headers" : {"Authorization" : "Bearer "+ token}
    };
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
}

function searchNearestEvent(near) {
  ////判定列(A)に1が入っている行を探す
  for(var i=2;i<dat.length;i++){
    if(dat[i][0] === 1) {
      var near = i; //start = dat[i][0]に1が入っていることが分かった
      i = dat.length; //for文強制終了
    }
  }
  return near;
}

function makeMessage(row, date) {
  //dat[i][1-4]...日時
  //dat[i][5,6]...イベント名、会場
  //dat[i][7-9]...集合時間、集合場所、座標
  //dat[i][10-19]...メンバー
  
  var message = "\n■□";
  
  if(date==today) {
    message = message + "本日";
  } else if(date==tomorrow) {
    message = message + "明日";
  } else {
    message = message + before + "日後";
  }
  message += "のイベント情報□■"
  
  message += "\n◆" + dat[row][5];
  
  message += "\n" + Utilities.formatDate(dat[row][1], 'Asia/Tokyo', 'M/d');
  
  if(dat[row][2] == "") { //開始日付◯ / 開始時刻× / 終了日付× / 終了時刻×
    message += " (開始時刻未定)"
  } else {
    message += " " + Utilities.formatDate(dat[row][2], 'Asia/Tokyo', 'H:mm') + " 〜";
    
    if(dat[row][3] != "") {
      message += " " + Utilities.formatDate(dat[row][3], 'Asia/Tokyo', 'M/d');
    }
    
    if(dat[row][4] != "") {
      message += " " + Utilities.formatDate(dat[row][4], 'Asia/Tokyo', 'H:mm');
    }
  }
  
  if(dat[row][6 == ""]) {
    message += "\n(会場未定)";
  } else {
    message += "\n会場: " + dat[row][6];
  }
  
  //以下、今日明日のみ(before日後の予定では使わない)
  if(date == next) {
    sendLine(message); //送って終わり
  } else {
    message += "\n\n◇集合"
    
    //集合時刻と集合場所は、どっちも書いてある時のみ記載・どっちか抜けてれば未定とする
    //かつ位置情報は時刻と場所が埋まっていて、位置情報も埋まっていれば記載する
    if( (dat[row][7] != "" ) && (dat[row][8] != "") ) {
      message += "\n" + Utilities.formatDate(dat[row][7], 'Asia/Tokyo', 'H:mm'); //集合時刻
      message += " " + dat[row][8]; //集合場所
      if(dat[row][9] != "") {
        message += "\n" + "https://www.google.co.jp/maps/place/" + dat[row][9]; //位置情報
      }
    } else {
      message += "\n(集合時刻・場所未定)";
    }
    
    message += "\n\n◇参加者"
      var participant = "";
      for(var i=10;i<=19;i++) {
        if(dat[row][i] == "◯") {
          if(participant != "") {
            participant += "、"
          }
          participant += dat[1][i];
        }
      }
      message += "\n" + participant;
    sendLine(message);
  }
}

function Main() {
  //[1]現在時刻から最も近いイベントが記入されている行を探す
  var near = searchNearestEvent(near);
  
  //[2]午前中のイベントは前日夜、午後のイベントは当日朝、1週間前のイベントを1週間前の夜に告知する
  
  //[2-1]開催日が当日かつ開始時刻がPMの場合、当日朝にリマインド(AM8-9時にプログラム実行をスケジューリング)
  //[2-2]開催日が翌日かつ開始時刻がAMの場合、前日夜にリマインド(PM8-9時にプログラム実行をスケジューリング)
  //[2-3]開催日がbefore日後なら、before日前の夜にリマインド(PM8-9時スケ)
  for(var i=0;i<count;i++) {
    if(dat[near+i][1] != "") {
      var day = Utilities.formatDate(dat[near+i][1], 'Asia/Tokyo', 'yyyy/MM/dd'); //取得した行に格納された開始日付
      var hour = dat[near+i][2].getHours(); //取得した行に格納された開始時刻
      
      if(hour < 12) {
        if(day == today) {
          makeMessage(near+i, today); //[2-1]
        }
      } else {
        if(day == tomorrow) {
          makeMessage(near+i, tomorrow); //[2-2]
        } else if(day == next) {
          makeMessage(near+i, next); //[2-3]
        }
      }
    } else {
      i = count; //dat[near+i][2] == ""になったら強制終了
    }
  }
}
