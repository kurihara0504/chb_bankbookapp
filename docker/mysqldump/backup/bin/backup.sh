#!/bin/bash

PATH=/opt/mysql/backup/data
BACKUP=${PATH}/bankbook_backup.sql

if [ ! -z $1 ];then
	BACKUP=${PATH}/$1
fi

/bin/mysqldump -u $MYSQL_ROOT_USER \
	-h $MYSQL_HOST \
	-P $MYSQL_PORT \
	-p$MYSQL_ROOT_PASSWORD \
	--single-transaction \
	--flush-logs \
	--complete-insert \
	--quick \
	--set-charset \
	--create-options \
	--skip-lock-tables \
	--skip-extended-insert \
	--default-character-set=utf8mb4 \
	--log-error=/opt/mysql/backup/bin/result.log \
	--databases bankbook > ${BACKUP}
