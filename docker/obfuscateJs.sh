#!/bin/sh
path=/home/ec2-user/Chb_BankBookApp/chb_bankbookapp/docker/jetty/ROOT
exceptJsFile='jquery-3.3.1.min.js|material.js|dialog-polyfill.js'

echo "["`date`"]「"$path"」配下ファイルの難読化開始"
for file in `find $path/js/ -name \*.js|grep -Ev $exceptJsFile`
do

  #コメントの削除
  sed -i '/\/\/ /d' $file

  #改行(LF)の削除
  sed -i ':loop; N; $!b loop; s/\n//g' $file
done
echo "["`date`"]「"$path"」配下ファイルの難読化終了"
