# Build stage
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run swagger

RUN npx tsc

# Runtime stage
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime

WORKDIR /app

# Copy the built files AND source files
COPY --from=build /app/src ./src
COPY --from=build /app .
COPY . .
COPY src/ .
# Add any other directories you need
RUN mv uploads ./src/uploads && mv config ./src/config && mv routes ./src/routes

# You can also move individual files if needed
RUN mv index.ts ./src/index.ts

EXPOSE 6072

CMD ["npm", "run", "dev"]
