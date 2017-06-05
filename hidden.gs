//
// hidden.js
// Created on 2017-06-05 12:40
// Created by sustny
//

function hidden() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('集計'), value1, value2
  var i=0, j=0
  
  value1 = sheet.getRange(7,1,26,1).getValues()
  while(i<20) {
    //Browser.msgBox("value1[" + i + "] = " + value1[i])
    if(value1[i] == 0) {
      sheet.hideRows(i+7,2)
    } else {
      sheet.showRows(i+7,2)
    }
    i=i+2
  }
  
  value2 = sheet.getRange(4,3,1,10).getValues()
  while(j<10) {
    //Browser.msgBox("value2[0][" + j + "] = " + value2[0][j])
    if(value2[0][j] == "") {
      sheet.hideColumns(j+3)
    } else {
      sheet.showColumns(j+3)
    }
    j++
  }
}
