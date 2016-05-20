FROM node:latest

RUN mkdir parse

ADD . /parse
WORKDIR /parse
RUN npm install

EXPOSE 1337

RUN mkdir certificate
RUN mkdir cloud
ADD $CERTIFICATE_URI /certificate
ADD $CLOUD_CODE_FILE /cloud/main.js

# Uncomment if you want to access cloud code outside of your container
# A main.js file must be present, if not Parse will not start

# VOLUME /parse/cloud

CMD [ "npm", "start" ]
