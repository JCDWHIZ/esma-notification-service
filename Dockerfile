# Build stage
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN apt-get update && apt-get install -y \
    apache-pulsar-client \
    apache-pulsar-client-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    libboost-all-dev \  
    libjsoncpp-dev \
    libprotobuf-dev \
    build-essential \
    python3 \
    pkg-config \
    protobuf-compiler \
    cmake \
    curl \
    && apt-get clean \
    ldconfig \
    && rm -rf /var/lib/apt/lists/*


RUN npm install --build-from-source pulsar-client

COPY . .
#COPY src/ ./src/
#COPY src/ ./src

RUN npx tsc

# Runtime stage
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime

WORKDIR /app

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
