
FROM alpine:latest

# Update System
RUN apk add --update && apk upgrade

# Install system packages
RUN apk add nodejs \
    npm \
    git

# Set app directory
WORKDIR /usr/src/app

# Copy files to application
ADD . /usr/src/app/

# Install dependancies
RUN npm install

# Expose port
EXPOSE 1343

# Start
CMD ["npm", "start"]