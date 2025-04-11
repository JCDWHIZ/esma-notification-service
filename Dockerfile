FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run swagger

RUN npx tsc

EXPOSE 6072

CMD ["npm", "run dev"]
