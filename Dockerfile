# Builder stage
FROM node:22.12.0-alpine AS builder

WORKDIR /usr/src/parse

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

# latest supported node version when this Dockerfile was written
FROM node:22.12.0-alpine

WORKDIR /usr/src/parse

# Copy only the required files from the builder stage
COPY --from=builder /usr/src/parse/node_modules ./node_modules
COPY --from=builder /usr/src/parse/dist ./dist
COPY --from=builder /usr/src/parse/public ./public

ENV APP_ID=setYourAppId
ENV MASTER_KEY=setYourMasterKey
ENV DATABASE_URI=setMongoDBURI

EXPOSE 1337

CMD ["node", "dist/index.js"]
