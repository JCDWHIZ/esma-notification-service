# Build stage
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i
COPY . .
RUN npx tsc

# Runtime stage
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
RUN npm i
EXPOSE 6072
CMD ["npm", "start"]