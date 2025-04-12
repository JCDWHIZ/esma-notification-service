# Build stage
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .
COPY src/ ./src/
RUN npm run swagger

RUN npx tsc

# Runtime stage
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime

WORKDIR /app

# Copy the built files AND source files
COPY --from=build /app/src src
COPY --from=build /app .
COPY . .
#COPY src/ .
#COPY src/ /src
EXPOSE 6072

CMD ["npm", "run", "dev"]
