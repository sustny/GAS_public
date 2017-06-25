//
// TideInfo.gs
// Created on 2017-06-23 13:30
// Created by sustny(http://sustny.me/)
// Data provided by Japan Meteorological Agency(http://www.jma.go.jp/jma/)
//
/*
http://www.data.jma.go.jp/kaiyou/db/tide/suisan/readme.html
毎時潮位データ	：	　１～　７２カラム	　３桁×２４時間（０時から２３時）
年月日	：	７３～　７８カラム	　２桁×３
地点記号	：	７９～　８０カラム	　２桁英数字記号
満潮時刻・潮位	：	８１～１０８カラム	　時刻４桁（時分）、潮位３桁（ｃｍ）
干潮時刻・潮位	：	１０９～１３６カラム	　時刻４桁（時分）、潮位３桁（ｃｍ）
※ 満（干）潮が予測されない場合、満（干）潮時刻を「9999」、潮位を「999」としています。
*/
// ------------------------------ データ構造分解図 ------------------------------
//毎時潮位データ: 0-2, 3-5, 6-8, 9-11, 12-14, 15-17, 18-20, ... , 66-18, 69-71;
//年月日: 72-77(年: 72-73 / 月: 74-75 / 日: 76-77);
//地点記号: 78-79;
//満潮(時刻,潮位): 80-83,84-86 / 87-90,91-93 / 94-97,98-100 / 101-104,105-107;
//干潮(時刻,潮位): 108-111,112-114 / 115-118,119-121 / 122-125,126-128 / 129-132,133-135;
// ------------------------------ データ構造分解図 ------------------------------

function DMStoDEGjp(n,e) { //気象庁が公開している位置情報特有の文字列だから変換できる超オレオレ関数
  var north = parseInt(n.substr(0,2)) + parseFloat(n.substr(3,2)/60);
  var east = parseInt(e.substr(0,3)) + parseFloat(e.substr(4,2)/60);
  return [north, east];
}

function searchNearPort(n,e) {
  //http://www.data.jma.go.jp/kaiyou/db/tide/suisan/station.php <- XmlService.parse()で解釈不可能なのでやむをえずPDICT(P:PORT), NDICT(N:NAME)に自力で書き出してる
  //51-76まで格納済み(大洗、鹿島 + 千葉、東京、神奈川)
  var PDICT = ['D3', 'D2', 'CS', 'ZF', 'MR',
               'TT', 'KZ', 'QL', 'CB', 'TK',
               'KW', 'YK', 'QS', 'HM', 'QN',
               'Z1', 'OK', 'QO', 'MJ', 'QP',
               'D4', 'QQ', 'CC', 'MC', 'D8',
               'OD']; //変数PORTに入力可能な記号を一覧化したもの
  var NDICT = ['大洗', '鹿島', '銚子漁港', '勝浦', '布良',
               '館山', '木更津', '千葉', '千葉港', '東京',
               '川崎', '京浜港', '横浜', '本牧', '横須賀',
               '油壺', '岡田', '神津島', '三宅島（坪田）', '三宅島（阿古）',
               '八丈島（八重根）', '八丈島（神湊）', '父島', '南鳥島', '湘南港',
               '小田原']; //PDICT内の記号に対応する名前を一覧化したもの
  var LDICT = [
    ['36°18', '35°56', '35°45', '35°08', '34°55',
     '34°59', '35°22', '35°34', '35°36', '35°39',
     '35°31', '35°28', '35°27', '35°26', '35°17',
     '35°10', '34°47', '34°13', '34°03', '34°04',
     '33°06', '33°08', '27°06', '24°17', '35°18',
     '35°14'],
    ['140°34', '140°42', '140°52', '140°15', '139°50',
     '139°51', '139°55', '140°03', '140°06', '139°46',
     '139°45', '139°38', '139°39', '139°40', '139°39',
     '139°37', '139°23', '139°08', '139°33', '139°29',
     '139°46', '139°48', '142°12', '153°59', '139°29',
     '139°09']
  ]; //PDICT内の記号に対応する位置情報を一覧化したもの
  
  var Distance = [];
  for(var i=0;i<PDICT.length;i++) {
    var LL = DMStoDEGjp(LDICT[0][i],LDICT[1][i]); //LL[0]:N / LL[1]:E
    //当該地点:n,e / 計算地点:LL[0],LL[1]
    var north = (LL[0]-n)*(LL[0]-n);
    var east = (LL[1]-e)*(LL[1]-e);
    var dist = north+east;
    Distance[i] = Math.sqrt(dist);
  }
  
  var point = Distance[0];
  for(i=1;i<PDICT.length-1;i++) {
    if(point>Distance[i]) {
      var count = i;
      point = Distance[i];
    }
  }
  LL = DMStoDEGjp(LDICT[0][count],LDICT[1][count])
  return [ PDICT[count], NDICT[count], LL[0], LL[1] ];
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
  var data = ['' + parseInt(txt.substr(80,2)) + ':' + parseInt(txt.substr(82,2)), parseInt(txt.substr(84,3)),
              '' + parseInt(txt.substr(87,2)) + ':' + parseInt(txt.substr(89,2)), parseInt(txt.substr(91,3)),
              '' + parseInt(txt.substr(94,2)) + ':' + parseInt(txt.substr(96,2)), parseInt(txt.substr(98,3)),
              '' + parseInt(txt.substr(101,2)) + ':' + parseInt(txt.substr(103,2)), parseInt(txt.substr(105,3)),
              '' + parseInt(txt.substr(108,2)) + ':' + parseInt(txt.substr(110,2)), parseInt(txt.substr(112,3)),
              '' + parseInt(txt.substr(115,2)) + ':' + parseInt(txt.substr(117,2)), parseInt(txt.substr(119,3)),
              '' + parseInt(txt.substr(122,2)) + ':' + parseInt(txt.substr(124,2)), parseInt(txt.substr(126,3)),
              '' + parseInt(txt.substr(129,2)) + ':' + parseInt(txt.substr(131,2)), parseInt(txt.substr(133,3))];
  return data;
}

function Main() {
  var program_start = new Date(); //処理時間計測用
  
  /* --------------------------------- 決める数値 ここから --------------------------------- */
  //まず行く場所を決めます(DEGで指定 釣りをやる場所)
  //var NOW = ['35.63', '140.07']; //稲毛海岸
  //var NOW = ['35.75', '139.77']; //足立小台
  //var NOW = ['35.32', '139.37']; //平塚
  var NOW = ['35.023494', '139.847086']; //館山
  //次に日付を指定します(yyyy/m/d);
  var YEAR = 2017;
  var MONTH = 7;
  var DAY = 8;
  /* --------------------------------- 決める数値 ここまで --------------------------------- */
  
  /* --------------------------- 自動的にあれこれやるエリア ここから --------------------------- */
  var message = "";
  //最も近い場所を求めます
  var PORT = searchNearPort(NOW[0], NOW[1]); //戻り値: 場所記号、場所名、緯度、経度
  message += '\n■□' + PORT[1] +'の潮位情報□■';
  
  for(var i=0;i<2;i++) {
  /* -------------------- 情報作成エリア ここから -------------------- */
    DAY += i;
    if(i != 0) { message += '\n';}
    message += '\n◆' + YEAR + '年' + MONTH + '月' + DAY + '日(' + '日月火水木金土'[new Date(YEAR + '/' + MONTH + '/' + DAY).getDay()] + ')';
    //var day = '日月火水木金土'[new Date().getDay()];
  
    //指定した日付でデータを収集します
    var Row = getText(PORT[0], YEAR, MONTH, DAY); //指定日付の潮位データ行まるごと
    //収集したデータを加工します
    var Info = TextConvert(Row); //Info[i] -> 満潮時刻、満潮潮位の順に格納。i=0-7が満潮、i=8-15が干潮、データなしの場合99:99/999を格納

    message += '\n◇潮位'
    if(Info[0].substr(0,2) > Info[8].substr(0,2)) {
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
  /* -------------------- 情報作成エリア ここまで -------------------- */
  }
  
  //GoogleMapのURL生成
  var toGoURL = 'https://www.google.com/maps/place/' + NOW[0] + ',' + NOW[1]; //行先の地図
  var TideURL = 'https://www.google.com/maps/place/' + PORT[2] + ',' + PORT[3]; //行先から最も近い潮位データの観測地点
  message += '\n\n◇行先\n' + toGoURL;
  message += '\n\n◇観測地\n' + TideURL;
  
  Logger.log(message);
  /* --------------------------- 自動的にあれこれやるエリア ここまで --------------------------- */
  var program_end = new Date(); //処理時間計測用
  var program_sec = (program_end-program_start)/1000; //処理時間計測用
  Logger.log("処理時間: " + program_sec + "秒");
}
