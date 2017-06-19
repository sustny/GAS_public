//
// LineNotify.gs
// Created on 2017-06-09 00:40
// Created by sustny
//
// Referenced: http://qiita.com/tadaken3/items/5f916a12587e42ece814
//

//------------------------------ Token List ------------------------------
var token = "***トークンID***"; //1対1グループ
//var token = "***トークンID***"; //本番用グループ
//------------------------------ Spreadsheet Loading ------------------------------
var sheet = SpreadsheetApp.getActive().getSheetByName('入力');
var dat = sheet.getDataRange().getValues(); //[Row(行): 1,2,3,...][Column(列): 0,1,2,...]
//------------------------------ Check Date ------------------------------
var today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
var yesterday = new Date();
yesterday.setDate(yesterday.getDate() + 1);
yesterday = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy/MM/dd');
var later = new Date();
later.setDate(later.getDate() + 7);
later = Utilities.formatDate(later, 'Asia/Tokyo', 'yyyy/MM/dd');
var time = new Date();
time = Utilities.formatDate(time, 'Asia/Tokyo', 'H'); //1週間後の予定を通知するときだけ使う
//------------------------------ Settings ------------------------------
var count = 5; //見に行くイベントの数(今日明日だけだし2でも大丈夫かも)
//------------------------------ Memo ------------------------------
//dat[0][0-6] = ["判定", "日付", "開始時刻", "イベント名", "開催場所", "集合時刻", "集合場所"]
//dat[0][7-15] = "参加者"
//dat[0][16] = "男女比"

function sendLine(message) {
  Logger.log("+++ Notify start!");
  var options =
    {
      "method"  : "post",
      "payload" : "message=" + message,
      "headers" : {"Authorization" : "Bearer "+ token}
    };
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
  Logger.log("+++ Notify end!");
}

function makeEventDate(row, day){
  var info = "\n■□";
  if(day == today) {
    info += "本日";
  } else if(day == yesterday) {
    info += "明日";
  } else if(day == later) {
    info += "1週間後"
  }
  info += "のイベント情報□■"; //タイトル

  if(dat[row][3] != "") { //イベント名
    info += "\n◆" + dat[row][3];
  }

  info += "\n" + Utilities.formatDate(dat[row][1], 'Asia/Tokyo', 'M月dd日'); //日付
  info += "(" + '日月火水木金土'[dat[row][1].getDay()] + ")" //曜日
  info += " " + Utilities.formatDate(dat[row][2], 'Asia/Tokyo', 'H:mm'); //開始時刻

  if(dat[row][4] != "") {
    info += " " + dat[row][4]; //開催場所
  } else {
    info += " ※場所未定";
  }

  info += "\n\n◇集合" //集合時間と場所(どっちか空欄なら未定)
  if( (dat[row][5] == "") || (dat[row][6] == "") ) {
    info += "\n(未定)"
  } else {
    info += "\n" + Utilities.formatDate(dat[row][5], 'Asia/Tokyo', 'H:mm') + " " + dat[row][6];
  }

  //参加者一覧形成
  var participant = ""
  for(i=7;i<=15;i++) {
    if(dat[row][i] == dat[1][17]) { //dat[1][17]...参加マーク("◯")格納セル
      if(participant != "") {
        participant = "" + participant + "、" //2人目以降は名前の前に区切り文字を入力する(ex: ABC -> A、B、C)
      }
      participant = "" + participant + dat[0][i] //dat[0][7~15]...参加者名
    }
  }

  if(participant == "") {
      participant = "\n\n◇参加者\n(未定)" //上のfor分を経ても参加者欄に誰も入力されていなかった場合
    } else {
      participant = "\n\n◇参加者\n" + participant + "\n(男女比 = " + dat[row][16] + ")"
    }

  sendLine(info+participant);
}

function LineNotifyMain(){
  var program_start = new Date(); //処理時間計測用
  Logger.log("-------------------- Start LineNotify.gs --------------------");

  Logger.log("----- Check a row in nearly event data is start. -----");
  //判定列(B)に1が入っている行を探す
  var start = 0;
  for(var i=1;i<dat.length;i++){
    Logger.log("i = " + i);
    if(dat[i][0] === 1){
      start = i; //start = dat[i][1]に1が入っていることが分かった
      i = dat.length; //forが終わる条件にして強制終了
      Logger.log("Row in nearly event is dat["+start+"][0]");
      Logger.log("----- Check a row in nearly event data is end. -----");
    }
  }

  Logger.log("");

  if(start == 0) {
    Logger.log("Row in nearly event is Nothing");
  } else {
    Logger.log("----- Start to notification. -----");
    var day, hour;
    for(i=0;i<count;i++) { //直近count回分のイベントを見に行く(ただしイベント情報がなくなった時点でelseでiにcountを代入し終了する)
      Logger.log("----- Count = " + i + " -----");
      if( (dat[start+i][1] != "") && (dat[start+i][2] != "") ) {
        day = Utilities.formatDate(dat[start+i][1], 'Asia/Tokyo', 'yyyy/MM/dd');
        hour = Utilities.formatDate(dat[start+i][2], 'Asia/Tokyo', 'H');

        //12時以前なら当日の予定だけ、12時以降なら明日の予定だけ通知を実行
        if(day == today) {
          Logger.log("+ Checking Event at PM");
          if(hour >= 12) {
            Logger.log("++ Today start!");
            makeEventDate(start+i, today);
            Logger.log("++ Today end!");
          } else {
            Logger.log("Excluded...");
          }
        } else if(day == yesterday) {
          Logger.log("+ Checking Event at AM");
          if(hour < 12) {
            Logger.log("++ Yesterday start!");
            makeEventDate(start+i, yesterday);
            Logger.log("++ Yesterday end!");
          } else {
            Logger.log("Through...");
          }
        } else if(day == later) {
          if(time >= 12) { //1週間後の予定について、現在時刻が12時以降の時だけ通知を実行
            Logger.log("++ A few days later start!");
            makeEventDate(start+i, later);
            Logger.log("++ A few days later end!");
          } else {
            Logger.log("Through...");
          }
        } else {
          Logger.log("Excluded...");
        }
      } else {
        Logger.log("Nothing...");
        i=count;
      }
    }
  }
  Logger.log("----- End to notification. -----");
  Logger.log("-------------------- End LineNotify.gs --------------------");

  var program_end = new Date(); //処理時間計測用
  var program_sec = (program_end-program_start)/1000; //処理時間計測用
  Logger.log("処理時間: " + program_sec + "秒");
}
