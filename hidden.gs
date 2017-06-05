//
// hidden.js
// Created on 2017-06-05 12:40
// Created by sustny
//

function hidden() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('集計');
  var range, value
  
  //あるセルが空白だったらその行(Row)を非表示にする + 空白でなかったら再表示する
  for(var i=3 ; i<=26 ; i++) { //A3 - A26を見る
    range = sheet.getRange(i,1); //getRange([行(1,2,3,...)],[列(A,B,C,...)])
    value = range.getValue()
    //Browser.msgBox(value) //for Debug
    if(value === "") {
      sheet.hideRows(i)
    } else {
      sheet.showRows(i)
    }
  }
  
  //あるセルが空白だったらその列(Column)を非表示にする + 空白でなかったら再表示する
  for(var j=2 ; j<=11 ; j++) { //B2 - K2を見る
    range = sheet.getRange(2,j);
    value = range.getValue()
    //Browser.msgBox(value) //for Debug
    if(value === "") {
      sheet.hideColumns(j)
    } else {
      sheet.showColumns(j)
    }
  }
}
