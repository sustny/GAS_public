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
    if(value1[i] == 0) { //A7からA26に格納された数字を見て、
      sheet.hideRows(i+7,2) //0なら2行隠す
    } else {
      sheet.showRows(i+7,2) //1なら2行表示させる
    }
    i=i+2
  }
  //本当はB列の各セルが空白かどうかで判定したかったけどなぜかうまくいかないので、いったんA列の各セルに空白なら0、そうでなければ1を入れる無駄な列を作った
  
  value2 = sheet.getRange(4,3,1,10).getValues()
  while(j<10) {
    //Browser.msgBox("value2[0][" + j + "] = " + value2[0][j])
    if(value2[0][j] == "") { //C4からM4を見て、
      sheet.hideColumns(j+3) //空白なら1列隠す
    } else {
      sheet.showColumns(j+3) //空白でなければ1列表示させる
    }
    j++
  }
}
