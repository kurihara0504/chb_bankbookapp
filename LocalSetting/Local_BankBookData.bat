@echo off
chcp 65001

rem create DataBase

rem You should change 'xxxxx' to your own root password.
rem You should change 'xxxxx' to your own workspace drive.
rem You should change 'xxxxx' to your own workspace directory.
set MysqlPassword=xxxxx
set WorkspaceDrive=xxxxx
set WorkSpaceName=xxxxx

echo Start to create local development environment. > result.log
echo Start to create local development environment.

set /p pushKey="Create DataBase(y/n)? : %pushKey%"
if "%pushKey%"=="y" (
	echo Insert data after create database.
	mysql -u root -h %MYSQL_HOST% -P %MYSQL_PORT% -p%MysqlPassword% < bankbook.sql >> result.log 2>&1
) else if "%pushKey%"=="n" ( 
	echo Skip the database creation.
) else (
	echo Because invalid value was entered, batch processing is terminated.
	pause
	exit
)

rem Insert data to your local database.

echo Start to insert data. >> result.log
echo Start to insert data.

mysql -u root -h %MYSQL_HOST% -P %MYSQL_PORT% -p%MysqlPassword% -v chb_bankbook < ..\docker\mysqldump\backup\bin\sql\degital_bankbookbase.sql >> result.log 2>&1
mysql -u root -h %MYSQL_HOST% -P %MYSQL_PORT% -p%MysqlPassword% -v chb_bankbook < update.sql >> result.log 2>&1

set PassbookCoverPath=
set AccountTranOrdinary=
set AccountTranSaving=
set AccountTranTime=

cd %workspaceDrive%:/%workSpaceName%/Chb_BankBookApp/chb_bankbookapp/src

FOR /F %%i in ('where /r . PassbookCover.jrxml') DO @SET PassbookCoverPath=%%i
FOR /F %%i in ('where /r . AccountTranOrdinary.jrxml') DO @SET AccountTranOrdinary=%%i
FOR /F %%i in ('where /r . AccountTranSaving.jrxml') DO @SET AccountTranSaving=%%i
FOR /F %%i in ('where /r . AccountTranTime.jrxml') DO @SET AccountTranTime=%%i

mysql -u root -h %MYSQL_HOST% -P %MYSQL_PORT% -p%MysqlPassword% chb_bankbook -e "UPDATE constant SET value = '%PassbookCoverPath:\=/%' WHERE key_name = 'BBKEY9201';"
mysql -u root -h %MYSQL_HOST% -P %MYSQL_PORT% -p%MysqlPassword% chb_bankbook -e "UPDATE constant SET value = '%AccountTranOrdinary:\=/%' WHERE key_name = 'BBKEY9202';"
mysql -u root -h %MYSQL_HOST% -P %MYSQL_PORT% -p%MysqlPassword% chb_bankbook -e "UPDATE constant SET value = '%AccountTranSaving:\=/%' WHERE key_name = 'BBKEY9203';"
mysql -u root -h %MYSQL_HOST% -P %MYSQL_PORT% -p%MysqlPassword% chb_bankbook -e "UPDATE constant SET value = '%AccountTranTime:\=/%' WHERE key_name = 'BBKEY9204';"

rem Start to place IndexController.java. (If it already exists under src, it will not be copied.)

cd %workspaceDrive%:\%workSpaceName%\Chb_BankBookApp\chb_bankbookapp\LocalSetting

if not exist "..\src\main\java\com\moneyforward\IndexController.java" (
	echo Start to place IndexController.java.
	copy .\IndexController.java ..\src\main\java\com\moneyforward\ >> result.log 2>&1
)

rem Start to place application-development.properties. (If it already exists under src, it will not be copied.)

if not exist "..\src\main\resources\application-development.properties" (
	echo Start to place application-development.properties.
	copy .\application-development.properties ..\src\main\resources\ >> result.log 2>&1
)

echo The creation of the local development environment has been completed. >> result.log
echo The creation of the local development environment has been completed.
pause