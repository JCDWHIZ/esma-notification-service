FROM --platform=linux/arm64 node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run swagger

RUN npx tsc

EXPOSE 6072

CMD ["npm", "run", "dev"]
