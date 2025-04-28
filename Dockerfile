# Builder stage
FROM node:20.19.1-alpine AS builder

WORKDIR /usr/src/parse

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

# latest supported node version when this Dockerfile was written
FROM node:20.19.1-alpine

WORKDIR /usr/src/parse

# Copy only the required files from the builder stage
COPY --from=builder /usr/src/parse/node_modules ./node_modules
COPY --from=builder /usr/src/parse/dist ./
COPY --from=builder /usr/src/parse/public ./public

VOLUME ["/usr/src/parse/cloud", "/usr/src/parse/logs"]

EXPOSE 1337

CMD ["node", "index.js"]
