FROM node:20-alpine

WORKDIR /app

RUN apk update && apk add --no-cache python3 py3-pip g++ openjdk17

COPY . .

RUN npm install

EXPOSE 5000

CMD [ "node", "server.js" ]