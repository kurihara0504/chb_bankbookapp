# Dockerfile
##########################
# base mysql version
##########################
FROM mysql:8.0.30
##########################
# execute command
##########################
COPY ./conf/my.cnf /etc/my.cnf
RUN mkdir -p /var/log/myblog \
    && chmod 744 /var/log/myblog \
    && chown mysql:mysql /var/log/myblog
