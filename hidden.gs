//
// hidden.js
// Created on 2017-06-04 17:00
// Created by sustny
//

function hidden() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('集計');
  var range, value
  
  for(var i=3 ; i<=7 ; i++) {
    range = sheet.getRange(3,i);
    value = range.getValue()
    //Browser.msgBox(value) //for Debug only
    if(value === "") {
      sheet.hideColumn(sheet.getRange(3,i))
    } else {
      sheet.showColumns(i)
    }
  }
}
