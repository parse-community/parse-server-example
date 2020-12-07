
FROM alpine:latest

# Update System
RUN apk add --update && apk upgrade

# Install system packages
RUN apk add nodejs \
    npm

# Set app directory
WORKDIR /usr/src/app

# Copy files to application
ADD . /usr/src/app/

# Expose port
EXPOSE 1340

# Start
CMD ["npm", "start"]