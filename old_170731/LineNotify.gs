//
// LineNotify.gs
// Created on 2017-06-26 10:10
// Created by sustny(http://sustny.me/)
//

function LineNotify(message) {
  //------------------------------ Token List ------------------------------
  var token = "*** トークンID 1 ***"; //1対1グループ
  //var token = "*** トークンID 2 ***"; //本番用グループ
  //------------------------------ Token List ------------------------------
  
  var options = {
    "method"  : "post",
    "payload" : "message=" + message,
    "headers" : {"Authorization" : "Bearer " + token}
  };
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify",options);
  return '';
}
