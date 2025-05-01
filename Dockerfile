# Build stage
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .
#COPY src/ ./src/
#COPY src/ ./src

RUN npx tsc

# Runtime stage
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libssl-dev \
    libcurl4-openssl-dev \
    libboost-all-dev \
    libjsoncpp-dev \
    libprotobuf-dev \
    protobuf-compiler \
    cmake \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the built files AND source files

COPY --from=build /app .
COPY . .
#COPY --from=build /app/src .
#COPY --from=build /app/src /src
COPY . .
# Ensure the src folder is copied correctly into /app/src
#COPY --from=build /app/src /app/src
#COPY src/ .
#COPY src/ /src
RUN chmod -R 755 /app
EXPOSE 6072

CMD ["npm", "run", "dev"]
