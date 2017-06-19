//
// LineNotify.gs
// Created on 2017-06-09 00:40
// Created by sustny
//
// Referenced: http://qiita.com/tadaken3/items/5f916a12587e42ece814
//

/* ------------------------------ Token List ------------------------------ */
//var token = "***トークンID***"; //1対1グループ
var token = "***トークンID***"; //本番用グループ
/* ------------------------------ Spreadsheet Loading ------------------------------ */
var sheet = SpreadsheetApp.getActive().getSheetByName('入力');
var dat = sheet.getDataRange().getValues(); //[Row(行): 1,2,3,...][Column(列): 0,1,2,...]
/* ------------------------------ Check Date ------------------------------ */
var today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
var yesterday = new Date();
yesterday.setDate(yesterday.getDate() + 1);
yesterday = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy/MM/dd');
/* ------------------------------ Settings ------------------------------ */
var count = 5; //見に行くイベントの数(今日明日だけだし2でも大丈夫かも)

function sendLine(message) {
  Logger.log("Notify start!")
  var options =
    {
      "method"  : "post",
      "payload" : "message=" + message,
      "headers" : {"Authorization" : "Bearer "+ token}
    };
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
  Logger.log("Notify end!")
}

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

function LineNotifyMain(){
  //判定列(B)に1が入っている行を探す
  //(1が入っているところが直近で一番近いのイベントの行というクソスプレッドシートを書いてしまったが、そっちを直すのがめんどいのでこっちが合わせていく)
  for(var i=1;i<dat.length;i++){
    if(dat[i][1] === 1){
      var start = i; //start = dat[i][1]に1が入っていることが分かった
      i = dat.length; //forが終わる条件にして強制終了
    }
  }
  
  var day, hour = new Date().getHours();
  for(i=0;i<count;i++) { //i<5は直近5回分のイベントを見に行くよっていう数字
    Logger.log("Event Count: i = " + i)
    if(dat[start+i][1] != "") {
      day = Utilities.formatDate(dat[start+i][0], 'Asia/Tokyo', 'yyyy/MM/dd')
      
      //12時以前なら当日の予定だけ、12時以降なら明日の予定だけ -> AMとPMそれぞれでGASのトリガーを登録すればうまいこといくやろ（適当）
      if((day == today)  && (hour < 12)) {
        Logger.log("Today start!")
        makeEventDate(start+i, today)
        Logger.log("Today end!")
      } else if((day == yesterday) && (hour > 12)) {
        Logger.log("Yesterday start!")
        makeEventDate(start+i, yesterday)
        Logger.log("Yesterday end!")
      }
    }
  }
}
