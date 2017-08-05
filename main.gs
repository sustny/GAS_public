//
// main.gs
// Created on 2017-07-30 15:25
// Created by sustny
//

/* ------------------------------ Settings ------------------------------ */
var FILE = SpreadsheetApp.openById('1XVMHAszEVVq-WSDkRjY0VN3cjt6YIuV4qsnEw8kDZPw');
var SHEET = FILE.getSheetByName('入力');
var DAT = SHEET.getDataRange().getValues();
var COUNT = 5;
/* ------------------------------ Settings ------------------------------ */

function main() {
  var start_program = Moment.moment();
  /* -------------------- main -------------------- */
  //Find the next event
  for(var i=1;i<=DAT.length;i++) {
    if(DAT[i][0] == 1) {
      var next_event = i;
      Logger.log(Moment.moment(DAT[i][1]).format('M月D日'));
      Logger.log(DAT[i][2]);
      Logger.log(Moment.moment(DAT[i][2]).format('H:mm'));
      Logger.log(DAT[i][3]);
      Logger.log(DAT[i][4]);
      break;
    }
  }
  
  //Choose an event to notify
  for(i=0;i<COUNT;i++) {
    //
  }
  
  /* -------------------- main -------------------- */
  Logger.log('実行時間: ' + (Moment.moment() - start_program) / 1000 + '秒');
}
