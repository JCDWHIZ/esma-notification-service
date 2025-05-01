# Build stage (for installing dependencies and building native modules)
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

# Install necessary tools for downloading files
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libboost-dev \
    libssl-dev \
    zlib1g-dev \
    wget \
    ca-certificates

# Download the C++ client installation script directly from GitHub
RUN wget https://raw.githubusercontent.com/apache/pulsar-client-node/master/pkg/linux/download-cpp-client.sh -O /tmp/download-cpp-client.sh

RUN chmod +x /tmp/download-cpp-client.sh && /tmp/download-cpp-client.sh

COPY package.json package-lock.json ./

RUN npm i

COPY . .

# Runtime stage (for running the application directly with ts-node-dev)
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime

WORKDIR /app

# Copy the entire application (including source files and node_modules)
COPY --from=build /app .

EXPOSE 6072

CMD ["npm", "run", "dev"]