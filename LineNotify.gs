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
var dat = sheet.getDataRange().getValues(); //[Row(行): 1,2,3,...][Column(列): 0,1,2,...]
var count = 7; //見に行くイベントの数

/* ------------------------------ Check Date ------------------------------ */
//現在の日付、曜日、時刻
var now_day = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
var now_week = new Date().getDay();
var now_hour = new Date().getHours();

//翌日の日付
var next_day = new Date();
next_day.setDate(next_day.getDate() + 1);
next_day = Utilities.formatDate(next_day, 'Asia/Tokyo', 'yyyy/MM/dd');

//翌週の日付
var next_week = new Date();
next_week.setDate(next_week.getDate() + 7);
next_week = Utilities.formatDate(next_week, 'Asia/Tokyo', 'yyyy/MM/dd');

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

/*
function makeEventDate(row, day){
  if(dat[row][5] != "") {
    dat[row][5] = Utilities.formatDate(dat[row][5], 'Asia/Tokyo', 'H:mm');
  }
  var date = [dat[row][3], dat[row][4], dat[row][5], dat[row][6]] //イベント名, 場所, 集合時間, 集合場所
  var name = ["", "開催場所", "集合時刻", "集合場所"]
  
  var time
  if(day == today) {
    time = "本日"
  } else if(day == yesterday) {
    time = "明日"
  }
  
  for(var i=0;i<4;i++) {
    if(date[i]=="") {
      date[i] = "("+ name[i] + "未定)"
    }
  }
  var info;
  info = ""+"\n■□" + time + "のイベント情報□■" + "\n【" + date[0] + "】\n" + date[1] + "\n\n【集合】\n" + date[2] + "\n" + date[3]
  
  //参加者一覧形成
  var participant = ""
  for(i=7;i<=15;i++) {
    if(dat[row][i] == dat[1][17]) { //dat[1][17]...参加マーク("◯")格納セル
      if(participant != "") {
        participant = "" + participant + "、"
      }
      participant = "" + participant + dat[0][i] //dat[0][7~15]...参加者名
    }
  }
  if(participant == "") {
      participant = "\n\n【参加者】\n(未定)"
    } else {
      participant = "\n\n【参加者】\n" + participant
    }
  
  sendLine(info+participant);
}
*/

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
  
  if(date==now_day) {
    message = message + "本日";
  } else if(date==next_day) {
    message = message + "明日";
  } else {
    message = message + "来週";
  }
  message += "のイベント情報□■"
  
  message += "\n◆" + dat[row][5];
  
  message += "\n" + Utilities.formatDate(dat[row][1], 'Asia/Tokyo', 'M/d');
  
  if(dat[row][2] == "") { //開始日付以外未定
    message += " (開始時刻未定)"
  } else if(dat[row][3] == "") { //終了未定
    message += " " + Utilities.formatDate(dat[row][2], 'Asia/Tokyo', 'H:mm');
  }
  
  if(dat[row][6 == ""]) {
    message += "\n(会場未定)";
  } else {
    message += "\n" + dat[row][6];
  }
  
  //以下、今日明日のみ(来週の予定では使わない)
  if(date == next_week) {
    sendLine(message); //送って終わり〜〜
  } else {
    message += "\n\n◇集合"
    if( (dat[row][7] != "" ) && (dat[row][8] != "") ) {
      message += "\n" + Utilities.formatDate(dat[row][7], 'Asia/Tokyo', 'H:mm'); //集合時刻
      message += " " + dat[row][8]; //集合場所
      message += "\n" + "https://www.google.co.jp/maps/place/" + dat[row][9]; //位置情報
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
  
  //[2]午前中のイベントは前日夜、午後のイベントは当日朝、加えて1週間前に全てのイベントを告知する
  for(var i=0;i<count;i++) {
    if(dat[near+i][2] != "") {
      var day = Utilities.formatDate(dat[near+i][1], 'Asia/Tokyo', 'yyyy/MM/dd'); //取得した行に格納された開始日付
      var hour = dat[near+i][2].getHours(); //取得した行に格納された開始時刻
      if( (day == now_day) && (hour >= 12) && (now_hour < 12) ) { //1-1. 今日の予定(投稿スケジュール: AM8-9時)
        makeMessage(near+i, now_day);
      } else if( (day == next_day) && (hour < 12) && (now_hour >= 12) ) { //1-2. 明日の予定(投稿スケジュール: PM8-9時)
        makeMessage(near+i, next_day);
      } else if( (day < next_week) && (now_week == 1) ) { //2. 次回の予定(投稿スケジュール: PM8-9時)
        makeMessage(near+i, next_week);
      }
    } else {
      i = count; //強制終了
    }
  }
}
