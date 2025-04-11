FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run swagger

RUN npx tsc

EXPOSE 7000

CMD ["npm", "run dev"]
