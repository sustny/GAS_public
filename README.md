# Google Apps Script

## 概要
情弱なので最近存在に気付きました。

JavaScript互換かつGoogle系のサービスと相性がいいみたいなので積極的に覚えていきます。

また、このリポジトリにあるスクリプトはGoogleスプレッドシートと対応しています。

## Hidden.gs
ある(行|列)のセルが空白なら、その(行|列)ごと隠すスクリプト。

## LineNotify.gs
直近のイベント情報をLINEに送信するスクリプト。

(17/06/20)FishingInfo.gsの関数をそのままコピペして、イベントが釣りだった場合に該当地域の潮位情報も通知するようにしました。

## FishingInfo.gs
場所(URL参照)と日付を指定して実行すると、潮位やこよみの情報を表示します。

場所はこちらから→https://drive.google.com/open?id=1QhhCBEdewuM-V39pam51TNJ-rZY&usp=sharing

### 仕様まとめ

0. (スクリプトは毎日20時頃自動で動くように設定済)
1. シートから直近のイベントが記入されている行を探す
2. もし、探してきたイベントが翌日 or 1週間後の開催なら通知をする
3. もし、釣り部のイベントならその日の潮位も同時に通知する
4. 2->3をcount回繰り返す(ただしイベントの記入がされていない行に突入したらその時点で終了)

※count, laterはソースコード上部のSettingsで宣言している

## 補足
スプレッドシートは個人情報を削除した上でそのうち公開すると思います。

-----

## ライセンス

各スクリプトは、MITライセンスのもとに公開いたします。LICENSE.txt を参照してください。

## License

This software is released under the MIT License, see LICENSE.txt.
