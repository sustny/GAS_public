//
// Hidden.gs
// Created on 2017-06-26 10:10
// Created by sustny(http://sustny.me/)
//

function Hidden() {
  //------------------------------- Settings -------------------------------
  var file = SpreadsheetApp.openById('*** スプレッドシートID ***');
  var sheet = file.getSheetByName('*** シート名 ***');
  var dat = sheet.getDataRange().getValues(); //[Row(行): 1,2,3,...][Column(列): 0,1,2,...]
  //------------------------------- Settings -------------------------------
  
  for(var i=2 ; i<=6 ; i++) {
    if(dat[2][i] == "") {
      sheet.hideColumns(i+1);
    } else {
      sheet.showColumns(i+1);
    }
  }
  return 0;
}
