#!/bin/sh

################################################################################

#

# Script Name : api_inf_icp_selectcount_memo.sh

# Function1 : selectCountMemo.sql 実行

# Function2 : backup.sh 実行

# User : root

# Usage : ./api_inf_icp_selectcount_memo.sh

# Input File : N/A

# Output File : N/A

# log File : /opt/mysql/backup/data/selectcount_memo.log.YYYYMMDD

# diff File : /opt/mysql/backup/data/bankbook_backup_diff_YYYYMMDDHHmmss.log

# Exit Code :  0 ... Succeed

#              1 ... Error

#

################################################################################

#

# History

#

# Ver   Os    Ha    Date       Name       Description

# ---- ----- ----- ---------- ----------- --------------------------------

# 1.0   7.4   N/A   2022/11/21 Suzuki     New Creation

# 1.1   7.4   N/A   2023/04/06 Suzuki     Output bank identifier to log

################################################################################



#-----------------------------

# 1.前処理

#-----------------------------



# 環境変数から銀行識別子を定義

namespace=`env | grep HOSTNAME | awk -F "=" '{print $2}' | awk -F "-" '{print $1}'`

if [ ${namespace} == daishi ]; then

    banknumber=`env | grep HOSTNAME | awk -F "=" '{print $2}' | awk -F "-" '{print $2}'`

    namespace=${namespace}-${banknumber}

fi



# ログ保存先の定義

logpath="/opt/mysql/backup/data"

LOG="${logpath}/`basename ${0} .sh`.log.`date +%Y%m%d`"



# ログローテートにより更新日時が3日前のログを削除

find ${logpath} -name *selectcount_memo.log* -mtime +3 | xargs rm -f



# 実行ログファイル header & footer 定義

function Header (){

echo ""

echo "#################################################################"

echo "#    `basename ${0}` 開始"

echo "#    `date +"%Y/%m/%d %H:%M:%S"`"

echo "#################################################################"

}

function Footer (){

echo "#################################################################"

echo "#    `basename ${0}` 終了"

echo "#    `date +"%Y/%m/%d %H:%M:%S"`"

echo "#################################################################"

echo ""

}


Header | tee -a ${LOG}



#-------------------#

#1-1.変数定義

#-------------------#

# メッセージ表示関連

THIS_SCRIPT_NAME=`basename $0`

DATE=`date +%Y%m%d%H%M%S`


# DBバックアップ関連

NORMAL_DB_BACKUP="bankbook_backup.sql"

ERROR_DB_BACKUP="bankbook_error_backup.sql"


#-----------------------------

#1-2. Log Output Process

# argument1:output content

#-----------------------------

function LogOutput() {

echo "`date +"%Y/%m/%d %H:%M:%S"` $1" |tee -a ${LOG}

}



#################

# 2.メイン処理

#################



# 開始メッセージ

START_MESSAGE="selectCountMemo.sql 実行"


LogOutput "【Info】$THIS_SCRIPT_NAMEスクリプトを実行します"



# 異常時のDBバックアップが存在する場合、異常時のDBバックアップと正常時のDBバックアップをリネームして退避

if [ -e ${logpath}/${ERROR_DB_BACKUP} ]; then

    LogOutput "=============================================="

    LogOutput "【Info】${namespace} 異常時のDBバックアップが存在するため、正常時と異常時のDBバックアップをリネームして退避します"

    cp -f ${logpath}/${NORMAL_DB_BACKUP} ${logpath}/bankbook_backup_${DATE}.sql

    mv -f ${logpath}/${ERROR_DB_BACKUP} ${logpath}/bankbook_error_backup_${DATE}.sql

    LogOutput "【Info】${namespace} DBバックアップリネーム後のls コマンド結果"

    ls -ltr ${logpath}/bankbook*.sql |tee -a ${LOG}

    LogOutput "=============================================="

fi



LogOutput "【Info】=========== コマンド出力結果 ==========="

LogOutput "【Info】=========== ${namespace} selectCountMemo.sql 実行 ==========="



# shell call

bash -c "/opt/mysql/backup/bin/selectData_bankbook.sh selectCountMemo.sql" > /dev/null 2>&1

if [ ! -s ${logpath}/selectCountMemo.csv ] > /dev/null 2>&1; then

    LogOutput "【Error】${namespace} selectCountMemo.csv が読み取れません。処理を終了します。"

    Footer | tee -a ${LOG}

    EXIT_CODE=1

    exit $EXIT_CODE

fi


LogOutput "【Info】${namespace} selectCountMemo.csv の値"

cat ${logpath}/selectCountMemo.csv |tee -a ${LOG}

LogOutput "=============================================="



LogOutput "【Info】${namespace} 各csv のls コマンド結果"

ls -ltr ${logpath}/*CountMemo.csv |tee -a ${LOG}

LogOutput "=============================================="



# previousCountMemo.csv の作成

if [ ! -e ${logpath}/latestCountMemo.csv ]; then

    LogOutput "【Info】${namespace} latestCountMemo.csv が作成されていません。"

else

    cp -fp ${logpath}/latestCountMemo.csv ${logpath}/previousCountMemo.csv

fi



# latestCountMemo.csv の作成

if [ ! -e ${logpath}/selectCountMemo.csv ]; then

    LogOutput "【Error】${namespace} selectCountMemo.csv が作成されていません。"

    EXIT_CODE=1

else

    if [ "${logpath}/selectCountMemo.csv" -ot "${logpath}/latestCountMemo.csv" ]; then

        LogOutput "【Error】${namespace} selectCountMemo.csv が latestCountMemo.csv より古い状態です。"

        EXIT_CODE=1

    else

        cp -fp ${logpath}/selectCountMemo.csv ${logpath}/latestCountMemo.csv

        EXIT_CODE=0

    fi

fi



# selectCountMemo.csv が latestCountMemo.csv より新しい状態の場合

if [ $EXIT_CODE -eq 0 ]; then



    # 初回起動時、latestCountMemo.csvからpreviousCountMemo.csv を複製

    if [ ! -e ${logpath}/previousCountMemo.csv ]; then

        LogOutput "【Info】${namespace} previousCountMemo.csv が作成されていません。"

        LogOutput "【Info】${namespace} 初回起動とみなし、csvを複製して比較処理をスキップします。"

        cp -fp ${logpath}/latestCountMemo.csv ${logpath}/previousCountMemo.csv

        COUNT_JUDGE=1

    else

        # 各csvの値を変数へ代入

        PREVIOUS_COUNT=`sed -n 2p ${logpath}/previousCountMemo.csv`

        LATEST_COUNT=`sed -n 2p ${logpath}/latestCountMemo.csv`

        if [ $LATEST_COUNT -ge $PREVIOUS_COUNT ]; then

            COUNT_JUDGE=1

        else

            COUNT_JUDGE=0

        fi



        LogOutput "【Info】${namespace} previousCountMemo.csv の値"

        cat ${logpath}/previousCountMemo.csv |tee -a ${LOG}

        LogOutput "=============================================="



        LogOutput "【Info】${namespace} latestCountMemo.csv の値"

        cat ${logpath}/latestCountMemo.csv |tee -a ${LOG}

        LogOutput "=============================================="



        LogOutput "【Info】${namespace} コピー後の各csv のls コマンド結果"

        ls -ltr ${logpath}/*CountMemo.csv |tee -a ${LOG}

        LogOutput "=============================================="



        # メモテーブルレコード件数の比較

        if [ $COUNT_JUDGE -eq 1 ]; then

            LogOutput "【Info】${namespace} メモテーブルレコード件数の比較結果が正常です。"

            EXIT_CODE=0

        else

            LogOutput "【Error】${namespace} メモテーブルレコード件数の比較結果が異常です。"

            EXIT_CODE=1

        fi

    fi

    # DBバックアップの取得

    if [ $COUNT_JUDGE -eq 1 ]; then

        LogOutput "【Info】${namespace} 通常のDBバックアップを取得します。"

        bash -c "/opt/mysql/backup/bin/backup.sh ${NORMAL_DB_BACKUP}" > /dev/null 2>&1

        LogOutput "【Info】${namespace} 通常のDBバックアップ取得後のls コマンド結果"

        ls -ltr ${logpath}/bankbook*.sql |tee -a ${LOG}

        LogOutput "=============================================="

        EXIT_CODE=0

    else

        LogOutput "【Error】${namespace} 異常時のDBバックアップを取得します。"

        bash -c "/opt/mysql/backup/bin/backup.sh ${ERROR_DB_BACKUP}" > /dev/null 2>&1

        LogOutput "【Error】${namespace} 異常時のDBバックアップ取得後のls コマンド結果"

        ls -ltr ${logpath}/bankbook*.sql |tee -a ${LOG}

        LogOutput "【Error】${namespace} 通常のDBバックアップと異常時のDBバックアップの差分を取得します。"

        diff ${logpath}/bankbook_backup.sql ${logpath}/bankbook_error_backup.sql > ${logpath}/bankbook_backup_diff_${DATE}.log

        LogOutput "【Error】${namespace} 差分取得後のls コマンド結果"

        ls -ltr ${logpath}/bankbook_backup_diff_*.log |tee -a ${LOG}

        LogOutput "=============================================="

        EXIT_CODE=1

    fi

fi



LogOutput "【Info】=========== ${namespace} selectCountMemo.sql 実行終了 ==========="



Footer|tee -a ${LOG}

exit $EXIT_CODE
