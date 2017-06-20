//
// FishingInfo.gs
// Created on 2017-06-20 13:00
// Created by sustny
//
// tide info: http://fishing-community.appspot.com/tidexml/doc
//

function FishingInfo(p, y, m, d) {
  var feedURL = 'http://fishing-community.appspot.com/tidexml/index?portid='+p+'&year='+y+'&month='+m+'&day='+d;
  var response = UrlFetchApp.fetch(feedURL);
  var xml = XmlService.parse(response.getContentText());
  var xmlStr1 = ['port-id', 'port-name', 'latitude1', 'longitude1', 'latitude2', 'longitude2', 'year', 'month', 'day', 'youbi', 'sunrise-time', 'sunset-time', 'moonrise-time', 'moonset-time', 'tide-name', 'tidedetails'];
  var xmlStr2 = ['tide-time', 'tide-level'];
  
  //タイトル
  var message = '\n■□' + xml.getRootElement().getChild(xmlStr1[1]).getText() + 'の潮位情報□■';
  
  //日付...yyyy年mm月dd日(ddd)
  message += '\n◆' + y + '年' + m + '月' + d + '日(' + xml.getRootElement().getChild(xmlStr1[9]).getText() + ')';
  
  var items = ""
  for(i=0;i<2;i++) {
    items = xml.getRootElement().getChildren(xmlStr1[xmlStr1.length-1]);
  }
  
  message += ' - ' + xml.getRootElement().getChild(xmlStr1[14]).getText();
  for(var i=0; i<items.length; i++) {
    var time = items[i].getChild(xmlStr2[0]).getText();
    var level = items[i].getChild(xmlStr2[1]).getText();
    if( (time != "") || (level != "") ) {
      message += '\n時刻: ' + time + ' / 潮位: ' + level + "cm";
    }
  }
  
  //日出・日入時刻
  message += '\n\n◇こよみ\n日出: ' + xml.getRootElement().getChild(xmlStr1[10]).getText() + ' / 日入: ' + xml.getRootElement().getChild(xmlStr1[11]).getText();
  //月出・月入時刻
  message += '\n月出: ' + xml.getRootElement().getChild(xmlStr1[12]).getText() + ' / 月入: ' + xml.getRootElement().getChild(xmlStr1[13]).getText();
  //地図
  message += '\n\n◇場所\nhttps://www.google.co.jp/maps/place/'+ xml.getRootElement().getChild(xmlStr1[4]).getText() + ',' + xml.getRootElement().getChild(xmlStr1[5]).getText();
  Logger.log(message);
}

function Main() {
  var place = 89; //ex: 96-晴海 / 89-立山 / 116-江の島
  var year = 2017;
  var month = 07;
  var day = 07;
  
  FishingInfo(place, year, month, day);
}
