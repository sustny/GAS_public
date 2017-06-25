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
  //https://www.google.com/maps/place/35°39'+139°46' <- 地図URLフォーマット。実装したからこのコメントごといつでも消していい(心配症なので残してる)
  //http://www.data.jma.go.jp/kaiyou/db/tide/suisan/station.php <- XmlService.parse()で解釈不可能なのでやむをえずPDICT(P:PORT), NDICT(N:NAME)に自力で書き出してる
  //53-76まで入れとこう(千葉、東京、神奈川)
  var PDICT = ['CS', 'ZF', 'MR', 'TT', 'KZ',
               'QL', 'CB', 'TK', 'KW', 'YK',
               'QS', 'HM', 'QN', 'Z1', 'OK',
               'QO', 'MJ', 'QP', 'D4', 'QQ',
               'CC', 'MC', 'D8', 'OD']; //変数PORTに入力可能な記号を一覧化したもの
  var NDICT = ['銚子漁港', '勝浦', '布良', '館山', '木更津',
               '千葉', '千葉港', '東京', '川崎', '京浜港',
               '横浜', '本牧', '横須賀', '油壺', '岡田',
               '神津島', '三宅島（坪田）', '三宅島（阿古）', '八丈島（八重根）', '八丈島（神湊）',
               '父島', '南鳥島', '湘南港', '小田原']; //PDICT内の記号に対応する名前を一覧化したもの
  var LDICT = [
    ['35°45', '35°08', '34°55', '34°59', '35°22',
     '35°34', '35°36', '35°39', '35°31', '35°28',
     '35°27', '35°26', '35°17', '35°10', '34°47',
     '34°13', '34°03', '34°04', '33°06', '33°08',
     '27°06', '24°17', '35°18', '35°14'],
    ['140°52', '140°15', '139°50', '139°51', '139°55',
     '140°03', '140°06', '139°46', '139°45', '139°38',
     '139°39', '139°40', '139°39', '139°37', '139°23',
     '139°08', '139°33', '139°29', '139°46', '139°48',
     '142°12', '153°59', '139°29', '139°09']
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
  if(y % 4 != 0) { //うるう年でない行: 0-30,31-58,59-89,90-119,120-150,151-180,181-211,212-242,243-272,273-303,304-333,334-364
    Logger.log('うるう年じゃない');
    var arrMonth = [0,31,59,90,120,151,181,212,243,273,304,334]; //各月の開始行
    var data = TXT.substr(( (137*arrMonth[m-1]) + (137*(d-1)) ),136);
  } else { //うるう年である行: 0-30,31-59,60-90,91-120,121-151,152-181,182-212,213-243,244-273,274-304,305-334,335-365
    Logger.log('うるう年やで');
    var arrMonth = [0,31,60,91,121,152,182,213,244,274,305,335]; //各月の開始行
    var data = TXT.substr(( (137*arrMonth[m-1]) + (137*(d-1)) ),136);
  }
  
  return data;
}

function TextConvert(txt) {
  //getTextでゲットした生データを加工する関数
  
  //さっきまで実装してたやつ 後で使う
  var Max = [txt.substr(80,4),txt.substr(84,3)];
  Logger.log('時刻: ' + parseInt(Max[0]) + ' 潮位: ' + parseInt(Max[1]));
}

function Main() {
  /* --------------------------------- 決める数値 ここから --------------------------------- */
  //まず行く場所を決めます(DEGで指定 釣りをやる場所)
  var NOW = ['35.63', '140.07'];
  //次に日付を指定します(yyyy/m/d);
  var YEAR = 2017;
  var MONTH = 7;
  var DAY = 3;
  /* --------------------------------- 決める数値 ここまで --------------------------------- */
  
  /* --------------------------- 自動的にあれこれやるエリア ここから --------------------------- */
  //最も近い場所を求めます
  var PORT = searchNearPort(NOW[0], NOW[1]); //戻り値: 場所記号、場所名、緯度、経度
  Logger.log('記号: ' + PORT[0] + ' / 湾名: ' + PORT[1] + ' / 緯度: ' + PORT[2] + ' / 経度: ' + PORT[3]);
  
  //指定した日付でデータを収集します
  var Row = getText(PORT[0], YEAR, MONTH, DAY); //指定日付の潮位データ行まるごと
  Logger.log(Row);
  //収集したデータを加工します
  var Info = TextConvert(Row);
  
  //GoogleMapのURLを生成します
  var toGoURL = 'https://www.google.com/maps/place/' + NOW[0] + ',' + NOW[1]; //行先の地図
  var TideURL = 'https://www.google.com/maps/place/' + PORT[2] + ',' + PORT[3]; //行先から最も近い潮位データの観測地点
  Logger.log('\n' + toGoURL + '\n' + TideURL);
  /* --------------------------- 自動的にあれこれやるエリア ここまで --------------------------- */
}
