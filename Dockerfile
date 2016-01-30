# Pull nodejs base image
FROM node:4.2.6-wheezy

# Author for nagging
MAINTAINER Daniel Mathews "dannyl.mathews@gmail.com"

RUN apt-get -y update

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /parse-server-example && cp -a /tmp/node_modules /parse-server-example/

ADD . /parse-server-example

# ADD datasources.json /parse-server-example/server/

# Expose running port
EXPOSE 1337

WORKDIR /parse-server-example

CMD ["npm", "start"]
