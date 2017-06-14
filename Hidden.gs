//
// Hidden.gs
// Created on 2017-06-14 15:20
// Created by sustny
//

/* ------------------------------ Settings ------------------------------ */
var sheet = SpreadsheetApp.getActive().getSheetByName('集計');
var dat = sheet.getDataRange().getValues();

function hidden() {
  //参加者
  sheet.showRows(7, 10);
  for(var i=6;i<16;i++) {
    if(dat[i][1] == "") {
      sheet.hideRows(i+1);
    }
  }
  
  //イベント
  sheet.showColumns(3, 5)
  for(i=2;i<7;i++) {
    if(dat[2][i] == "") {
      sheet.hideColumns(i+1);
    }
  }
}
