//
// hidden.js
// Created on 2017-06-04 17:00
// Created by sustny
//

function hidden() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('集計');
  var range, value
  
  for(var i=3 ; i<=26 ; i++) {
    range = sheet.getRange(i,1);
    value = range.getValue()
    //Browser.msgBox(value) //for Debug only
    if(value === "") {
      sheet.hideRow(sheet.getRange(i,2))
    } else {
      sheet.showRows(i)
    }
  }
  
  for(var j=2 ; j<=11 ; j++) {
    range = sheet.getRange(2,j);
    value = range.getValue()
    //Browser.msgBox(value) //for Debug only
    if(value === "") {
      sheet.hideColumn(sheet.getRange(2,j))
    } else {
      sheet.showColumns(j)
    }
  }
}
