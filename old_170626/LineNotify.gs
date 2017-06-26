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
//dat[0][17] = "釣り判定"
//dat[0][18] = "選択肢"

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
  info += "(" + '日月火水木金土'[dat[row][1].getDay()] + ")"; //曜日
  info += " " + Utilities.formatDate(dat[row][2], 'Asia/Tokyo', 'H:mm'); //開始時刻
  
  if(dat[row][4] != "") {
    info += " " + dat[row][4]; //開催場所
  } else {
    info += " ※場所未定";
  }

  info += "\n\n◇集合" //集合時間と場所(どっちか空欄なら未定)
  if( (dat[row][5] == "") || (dat[row][6] == "") ) {
    info += "\n(未定)";
  } else {
    info += "\n" + Utilities.formatDate(dat[row][5], 'Asia/Tokyo', 'H:mm') + " " + dat[row][6];
  }

  //参加者一覧形成
  var participant = ""
  for(i=7;i<=15;i++) {
    if(dat[row][i] == dat[1][18]) { //dat[1][17]...参加マーク("◯")格納セル
      if(participant != "") {
        participant = "" + participant + "、"; //2人目以降は名前の前に区切り文字を入力する(ex: ABC -> A、B、C)
      }
      participant = "" + participant + dat[0][i]; //dat[0][7~15]...参加者名
    }
  }

  if(participant == "") {
      participant = "\n\n◇参加者\n(未定)"; //上のfor分を経ても参加者欄に誰も入力されていなかった場合
    } else {
      participant = "\n\n◇参加者\n" + participant + "\n(男女比 = " + dat[row][16] + ")";
    }

  sendLine(info+participant);
}

function FishingInfo(p, y, m, d) {
  var feedURL = 'http://fishing-community.appspot.com/tidexml/index?portid='+p+'&year='+y+'&month='+m+'&day='+d;
  var response = UrlFetchApp.fetch(feedURL);
  var xml = XmlService.parse(response.getContentText());
  var xmlStr1 = ['port-id', 'port-name', 'latitude1', 'longitude1', 'latitude2', 'longitude2', 'year', 'month', 'day', 'youbi', 'sunrise-time', 'sunset-time', 'moonrise-time', 'moonset-time', 'tide-name', 'tidedetails'];
  var xmlStr2 = ['tide-time', 'tide-level'];
  
  //タイトル
  var message = '\n■□' + xml.getRootElement().getChild(xmlStr1[1]).getText() + 'の潮位情報□■';
  
  //日付...yyyy年mm月dd日(ddd)
  message += '\n◆' + y + '年' + m + '月' + d + '日(' + xml.getRootElement().getChild(xmlStr1[9]).getText() + ')';
  
  var items = ""
  for(i=0;i<2;i++) {
    items = xml.getRootElement().getChildren(xmlStr1[xmlStr1.length-1]);
  }
  
  message += ' - ' + xml.getRootElement().getChild(xmlStr1[14]).getText();
  for(var i=0; i<items.length; i++) {
    var time = items[i].getChild(xmlStr2[0]).getText();
    var level = items[i].getChild(xmlStr2[1]).getText();
    if( (time != "") || (level != "") ) {
      message += '\n時刻: ' + time + ' / 潮位: ' + level + "cm";
    }
  }
  
  //日出・日入時刻
  message += '\n\n◇こよみ\n日出: ' + xml.getRootElement().getChild(xmlStr1[10]).getText() + ' / 日入: ' + xml.getRootElement().getChild(xmlStr1[11]).getText();
  //月出・月入時刻
  message += '\n月出: ' + xml.getRootElement().getChild(xmlStr1[12]).getText() + ' / 月入: ' + xml.getRootElement().getChild(xmlStr1[13]).getText();
  //地図
  message += '\n\n◇観測地点\nhttps://www.google.co.jp/maps/place/'+ xml.getRootElement().getChild(xmlStr1[4]).getText() + ',' + xml.getRootElement().getChild(xmlStr1[5]).getText();
  sendLine(message);
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
    for(i=0;i<count;i++) { //直近count回分のイベントを見に行く(ただしイベント情報がなくなった時点でelseでiにcountを代入し終了する)
      Logger.log("----- Count = " + i + " -----");
      if( (dat[start+i][1] != "") && (dat[start+i][2] != "") ) {
        var day = Utilities.formatDate(dat[start+i][1], 'Asia/Tokyo', 'yyyy/MM/dd');
        var FishY = Utilities.formatDate(dat[start+i][1], 'Asia/Tokyo', 'yyyy');
        var FishM = Utilities.formatDate(dat[start+i][1], 'Asia/Tokyo', 'MM');
        var FishD =Utilities.formatDate(dat[start+i][1], 'Asia/Tokyo', 'dd');
        
        //紆余曲折あったけど、明日の予定と1週間後の予定だけを夜に通知するようにした
        if(day == yesterday) {
          Logger.log("++ Yesterday start!");
          makeEventDate(start+i, yesterday);
          if(dat[start+i][17] != "" ) {
            Logger.log("+ FishingInfo start!");
            FishingInfo(dat[start+i][17], FishY, FishM, FishD);
            Logger.log("+ FishingInfo end!");
          }
          Logger.log("++ Yesterday end!");
          
        } else if(day == later) {
          Logger.log("++ A few days later start!");
          makeEventDate(start+i, later);
          if(dat[start+i][17] != "" ) {
            Logger.log("+ FishingInfo start!");
            FishingInfo(dat[start+i][17], FishY, FishM, FishD);
            Logger.log("+ FishingInfo end!");
          }
          Logger.log("++ A few days later end!");
          
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
  
  /* そのうち形を変えて使う(多分)
  for(i=0;i<15;i++) {
    var j = i+1;
    //Logger.log("セルD" + j + " = " + dat[i][3]);
    if(dat[i][3].match(/釣り/)) {
      Logger.log("セルD" + j + " is 釣りの日");
    } else {
      Logger.log("セルD" + j + " is not 釣りの日");
    }
  }*/
}
