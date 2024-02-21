CREATE DATABASE chb_bankbook DEFAULT CHARACTER SET utf8mb4;

CREATE USER IF NOT EXISTS 'moneyforward'@'%' IDENTIFIED BY 'mf123da';

GRANT ALL ON chb_bankbook.* TO moneyforward@'%';