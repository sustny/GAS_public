//
// Hidden.gs
// Created on 2017-06-04 17:00
// Created by sustny
//

function hidden() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName("集計");
  var dat1 = sheet1.getDataRange().getValues();

  for(var i=2 ; i<=6 ; i++) {
    Logger.log(dat1[2][i]);
    if(dat1[2][i] == "") {
      sheet1.hideColumns(i+1);
    } else {
      sheet1.showColumns(i+1);
    }
  }
}
