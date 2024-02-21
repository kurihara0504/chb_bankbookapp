#!/bin/bash
fileName=${1/.sql/}
sqlPath="/opt/mysql/backup/bin/sql"
logPath="/opt/mysql/backup/data"
mysql -u $MYSQL_ROOT_USER \
          -h $MYSQL_HOST \
          -P $MYSQL_PORT \
          -p$MYSQL_ROOT_PASSWORD \
          bankbook < $sqlPath/$1 |sed -e "s/\t/,/g" > $logPath/${fileName}.csv