FROM oraclelinux:8.6

ENV LANG=en_US.utf8
COPY ./conf/my.cnf /etc/my.cnf
# execute command
RUN yum -y update --exclude redhat-release*,oraclelinux-release* \
    && yum -y module disable mysql \
    && rpm -ivh https://dev.mysql.com/get/mysql80-community-release-el8-4.noarch.rpm \
    && yum -y install mysql-community-common-8.0.30 mysql-community-client-8.0.30 \
    && mkdir -p /etc/mysql/ \
    && mkdir -p /opt/mysql/backup/data \
    && mkdir -p /opt/mysql/backup/bin \
    && chmod 764 -R /opt/mysql/backup/ \
    && rm -rf /var/cache/yum/* \
    && yum clean all
