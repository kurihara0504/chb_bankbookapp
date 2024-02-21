##########################
# base jetty version
##########################
FROM oraclelinux:8.6
##########################
# delivery resources
##########################
ENV LANG=C.UTF-8
RUN yum -y install fontconfig
RUN yum -y install java-17-openjdk-headless
RUN groupadd -g 110 jetty
RUN useradd -u 110 -g jetty -d /var/lib/jetty jetty
RUN rm -rf /usr/local/jetty \
    && curl -LO https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-home/11.0.12/jetty-home-11.0.12.tar.gz \
    && tar xfz jetty-home-11.0.12.tar.gz -C /usr/local/ \
    && mv /usr/local/jetty-home-11.0.12/ /usr/local/jetty
COPY ./conf/start.ini /usr/local/jetty/
COPY ./conf/docker-entrypoint.sh /
COPY ./conf/generate-jetty-start.sh /
COPY ./conf/jetty-threadpool.xml /usr/local/jetty/etc/
COPY ./conf/jetty.xml /usr/local/jetty/etc/
COPY ./conf/jetty-http.xml /usr/local/jetty/etc/
COPY ./conf/webdefault.xml /usr/local/jetty/etc/
COPY ./conf/jetty-rewrite.xml /usr/local/jetty/etc/
COPY ./sp2.war /var/lib/jetty/webapps/
ADD ./ROOT /var/lib/jetty/webapps/ROOT/
ADD ./report /data/report
WORKDIR /var/lib/jetty
RUN java -jar "/usr/local/jetty/start.jar" --add-modules=ext,resources,server,deploy,http,jsp,jstl,rewrite,websocket
ENTRYPOINT [ "/docker-entrypoint.sh" ]
##########################
# execute command
##########################
RUN chown -R  jetty:jetty /var/lib/jetty/webapps \
    && mkdir -p /data/report \
    && chmod 744 /data/report \
    && chown jetty:jetty /data/report \
    && mkdir -p /data/log \
    && chmod 744 /data/log \
    && chown jetty:jetty /data/log
