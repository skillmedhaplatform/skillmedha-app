FROM node:current-alpine3.22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

COPY .env.prod .env.production

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
