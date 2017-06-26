//
// EventInfo.gs
// Created on 2017-06-26 10:20
// Created by sustny(http://sustny.me/)
//

function EventInfo(row, day) {
  //------------------------------ Check Date ------------------------------
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() + 1);
  yesterday = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy/MM/dd');
  var later = new Date();
  later.setDate(later.getDate() + 7);
  later = Utilities.formatDate(later, 'Asia/Tokyo', 'yyyy/MM/dd');
  //------------------------------ Check Date ------------------------------
  
  //------------------------------- Settings -------------------------------
  var file = SpreadsheetApp.openById('*** スプレッドシートID ***');
  var sheet = file.getSheetByName('*** シート名 ***');
  var dat = sheet.getDataRange().getValues(); //[Row(行): 0,1,2,...][Column(列): 0,1,2,...]
  //------------------------------- Settings -------------------------------
  
  //------------------------------ Memo ------------------------------
  //dat[0][0-8] = ["判定", "日付", "開始時刻", "イベント名", "開催場所", "位置情報", "集合時刻", "集合場所", "位置情報"]
  //dat[0][9-17] = "参加者"
  //dat[0][18] = "男女比"
  //dat[0][19] = "選択肢"
  //-------------------------------------------------------------
  
  var info = "\n■□";
  if(day == yesterday) {
    info += "明日";
  } else if(day == later) {
    info += "1週間後"
  }
  info += "のイベント情報□■"; //タイトル
  
  if(dat[row][3] != "") { //イベント名
    info += "\n◆" + dat[row][3];
  }
  
  info += "\n" + Utilities.formatDate(dat[row][1], 'Asia/Tokyo', 'M月d日'); //日付
  info += "(" + '日月火水木金土'[dat[row][1].getDay()] + ")"; //曜日
  info += " " + Utilities.formatDate(dat[row][2], 'Asia/Tokyo', 'H:mm'); //開始時刻
  
  if(dat[row][4] != "") {
    info += ' ' + dat[row][4]; //開催場所
    info += '\nhttps://www.google.co.jp/maps/place/' + dat[row][5];
  } else {
    info += " ※場所未定";
  }

  info += "\n\n◇集合" //集合時間と場所(どっちか空欄なら未定)
  if( (dat[row][5] == "") || (dat[row][6] == "") ) {
    info += "\n(未定)";
  } else {
    info += "\n" + Utilities.formatDate(dat[row][6], 'Asia/Tokyo', 'H:mm') + " " + dat[row][7];
    info += '\nhttps://www.google.co.jp/maps/place/' + dat[row][8];
  }

  //参加者一覧形成
  var participant = ""
  for(i=9;i<=17;i++) {
    if(dat[row][i] == dat[1][19]) { //dat[1][19]...参加マーク("◯")格納セル
      if(participant != "") {
        participant = "" + participant + "、"; //2人目以降は名前の前に区切り文字を入力する(ex: ABC -> A、B、C)
      }
      participant = "" + participant + dat[0][i]; //dat[0][9-17]...参加者名
    }
  }
  if(participant == "") {
      participant = "\n\n◇参加者\n(未定)"; //上のfor分を経ても参加者欄に誰も入力されていなかった場合
    } else {
      participant = "\n\n◇参加者\n" + participant + "\n(男女比 = " + dat[row][18] + ")";
    }

  return (info+participant);
  //-------------------------------------------------------------
}
