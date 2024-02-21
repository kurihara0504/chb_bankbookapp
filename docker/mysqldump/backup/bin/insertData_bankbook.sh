#!/bin/bash
mysql -u $MYSQL_ROOT_USER \
          -h $MYSQL_HOST \
          -P $MYSQL_PORT \
          -p$MYSQL_ROOT_PASSWORD \
          bankbook < /opt/mysql/backup/bin/sql/degital_bankbookbase.sql
