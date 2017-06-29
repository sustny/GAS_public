//
// TideInfo.gs
// Created on 2017-06-23 13:30
// Created by sustny(http://sustny.me/)
// Data provided by Japan Meteorological Agency(http://www.jma.go.jp/jma/)
//

function DMStoDEGjp(n,e) { //気象庁が公開している位置情報特有の文字列だから変換できる超オレオレ関数
  var north = parseInt(n.substr(0,2)) + parseFloat(n.substr(3,2)/60);
  var east = parseInt(e.substr(0,3)) + parseFloat(e.substr(4,2)/60);
  return [north, east];
}

function searchNearPort(n,e) {
  //原本 http://www.data.jma.go.jp/kaiyou/db/tide/suisan/station.php
  //転記 https://docs.google.com/spreadsheets/d/1MkW9mP_qpyC3GI_Y9_j8dD7kusNkycCixXflXo0Tro8/edit?usp=sharing
  var FILE = SpreadsheetApp.openById('1MkW9mP_qpyC3GI_Y9_j8dD7kusNkycCixXflXo0Tro8');
  var SHEET = FILE.getSheetByName('Data');
  var DICT = SHEET.getDataRange().getValues();
  
  //ピタゴラスの定理で2点間の距離を求め、配列Distance[]に格納
  var Distance = [];
  for(var i=0;i<DICT.length-1;i++) {
    
    var LL = DMStoDEGjp(DICT[i+1][3],DICT[i+1][4]);
    var north = ( parseFloat(LL[0]) - parseFloat(n) )*( parseFloat(LL[0]) - parseFloat(n) );
    var east = ( parseFloat(LL[1]) - parseFloat(e) )*( parseFloat(LL[1]) - parseFloat(e) );
    var dist = north+east;
    Distance[i] = Math.sqrt(dist);
  }  
  
  //上で求めた2点間の距離の中で最も距離が短いものを探索
  var short = Distance[0];
  for(i=1;i<DICT.length-1;i++) {
    if(short>Distance[i]) {
      var count = i;
      short = Distance[i];
    }
  }
  LL = DMStoDEGjp(DICT[count+1][3],DICT[count+1][4]);
  return [ DICT[count+1][1], DICT[count+1][2], LL[0], LL[1] ]; //行先に最も近い観測地点の記号、名前、北緯、東経を返す
}

function getText(p, y, m, d) {  
  var URL = UrlFetchApp.fetch('http://www.data.jma.go.jp/kaiyou/data/db/tide/suisan/txt/' + y +'/' + p + '.txt');
  var TXT = URL.getContentText();
  
  //うるう年判定
  if(y % 4 != 0) {
    var arrMonth = [0,31,59,90,120,151,181,212,243,273,304,334]; //各月の開始行
    var data = TXT.substr(( (137*arrMonth[m-1]) + (137*(d-1)) ),136);
  } else {
    var arrMonth = [0,31,60,91,121,152,182,213,244,274,305,335]; //各月の開始行
    var data = TXT.substr(( (137*arrMonth[m-1]) + (137*(d-1)) ),136);
  }
  
  return data;
}

function TextConvert(txt) { //getTextでゲットした生データを加工する関数
  var data = [];
  for(var i=0;i<8;i++) {
    if( parseInt(txt.substr(82+(i*7),2)) < 10 ) {
      data[i*2] = '' + txt.substr(80+(i*7),2) + ':0' + parseInt(txt.substr(82+(i*7),2));
    } else {
      data[i*2] = '' + txt.substr(80+(i*7),2) + ':' + parseInt(txt.substr(82+(i*7),2));
    }
    data[(i*2)+1] = parseInt(txt.substr(84+(i*7),3));
  }
  return data;
}

function TideInfo(NOW, YEAR, MONTH, DAY) {
  /* ----------------------------------- 引数処理 ここから ---------------------------------- */
  for(var i=0;i<NOW.length;i++) {
    if(NOW.substr(i,1) == ',') {
      var NOW0 = NOW.substr(0,i);
      var NOW1 = NOW.slice(i+1,NOW.length);
      break;
    }
  }
  YEAR = parseInt(YEAR);
  MONTH = parseInt(MONTH);
  DAY = parseInt(DAY);
  /* ----------------------------------- 引数処理 ここまで ---------------------------------- */
  
  /* --------------------------- 自動的にあれこれやるエリア ここから --------------------------- */
  var message = "";
  //最も近い場所を求めます
  var PORT = searchNearPort(NOW0, NOW1); //戻り値: 場所記号、場所名、緯度、経度
  message += '\n■□' + PORT[1] +'の潮位情報□■';
  
  /* -------------------- 情報作成エリア ここから -------------------- */
  for(var i=0;i<2;i++) {
    DAY += i;
    if(i != 0) { message += '\n';}
    //指定した日付でデータを収集します
    var Row = getText(PORT[0], YEAR, MONTH, DAY); //指定日付の潮位データ行まるごと
    //収集したデータを加工します
    var Info = TextConvert(Row); //Info[i] -> 満潮時刻、満潮潮位の順に格納。i=0-7が満潮、i=8-15が干潮、データなしの場合99:99/999を格納
    
    message += '\n◆' + parseInt(Row.substr(74,2)) + '月' + parseInt(Row.substr(76,2)) + '日(' + '日月火水木金土'[new Date(YEAR + '/' + MONTH + '/' + DAY).getDay()] + ')';

    message += '\n◇潮位'
    if( parseInt(Info[0].substr(0,2)) < parseInt(Info[8].substr(0,2)) ) {
      for(var j=0;j<8;j+=2) {
        if(Info[j+1] != 999) {
          message += '\n【満】' + Info[j] + ' / ' + Info[j+1] + 'cm';
        }
        if(Info[j+9] != 999) {
          message += '\n【干】' + Info[j+8] + ' / ' + Info[j+9] + 'cm'
        }
      }
    } else {
      for(var j=0;j<8;j+=2) {
        if(Info[j+9] != 999) {
          message += '\n【干】' + Info[j+8] + ' / ' + Info[j+9] + 'cm'
        }
        if(Info[j+1] != 999) {
          message += '\n【満】' + Info[j] + ' / ' + Info[j+1] + 'cm';
        }
      }
    }
  }
  /* -------------------- 情報作成エリア ここまで -------------------- */
  
  //GoogleMapのURL生成
  var TideURL = 'https://www.google.com/maps/place/' + PORT[2] + ',' + PORT[3]; //行先から最も近い潮位データの観測地点
  message += '\n\n◇観測地\n' + TideURL;
  /* --------------------------- 自動的にあれこれやるエリア ここまで --------------------------- */
  
  return message;
}
