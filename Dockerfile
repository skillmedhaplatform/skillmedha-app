FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

COPY .env.prod .env.production

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
