//
// Main.gs
// Created on 2017-06-26 10:00
// Created by sustny(http://sustny.me/)
//

function Main() {
  var program_start = new Date(); //処理時間計測用
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
  var count = 5;
  //------------------------------- Settings -------------------------------
  
  //判定行(A)に1が入っている行を探す
  for(var i=1;i<dat.length;i++) {
    if(dat[i][0] === 1) {
      break;
    }
  }
  
  if(i != 0) {
    for(var j=0;j<count;j++) { //直近count回分のイベントを見に行く(ただしイベント情報がなくなった時点でbreak)
      if( (dat[i+j][1] != "") && (dat[i+j][2] != "") ) {
        var day = Utilities.formatDate(dat[i+j][1], 'Asia/Tokyo', 'yyyy/MM/dd');
        
        //イベントが明日or1週間後の時に通知(それぞれでパラメータが変わる)
        var message = '';
        if(day == yesterday) {
          message += EventInfo(i+j, yesterday);
          if( (dat[i+j][3].match(/釣/)) && (dat[i+j][5] != '') ) {
            message += '\n' + TideInfo(dat[i+j][5], Utilities.formatDate(dat[i+j][1], 'Asia/Tokyo', 'yyyy'), Utilities.formatDate(dat[i+j][1], 'Asia/Tokyo', 'M'), Utilities.formatDate(dat[i+j][1], 'Asia/Tokyo', 'd'));
          }
          message = LineNotify(message);
          
        } else if(day == later) {
          message += EventInfo(i+j, later);
          if( (dat[i+j][3].match(/釣/)) && (dat[i+j][5] != '') ) {
            message += '\n' + TideInfo(dat[i+j][5], Utilities.formatDate(dat[i+j][1], 'Asia/Tokyo', 'yyyy'), Utilities.formatDate(dat[i+j][1], 'Asia/Tokyo', 'M'), Utilities.formatDate(dat[i+j][1], 'Asia/Tokyo', 'd'));
          }
          message = LineNotify(message);
          
        }
      } else {
        break;
      }
    }
  }
  
  var program_end = new Date(); //処理時間計測用
  var program_sec = (program_end-program_start)/1000; //処理時間計測用
  Logger.log("Hidden()前処理時間: " + program_sec + "秒");
  Hidden(); //ついでに実行
  var program_end = new Date(); //処理時間計測用
  var program_sec = (program_end-program_start)/1000; //処理時間計測用
  Logger.log("Hidden()後処理時間: " + program_sec + "秒");
}
