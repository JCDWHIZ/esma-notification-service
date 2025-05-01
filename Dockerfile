# Build stage (for installing dependencies and building native modules)
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

# Install necessary build tools and dependencies for compiling the C++ client
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libboost-dev \
    libssl-dev \
    zlib1g-dev

# Download and execute the script to install the Pulsar C++ client
COPY --from=apache/pulsar-client-node:latest /pkg/linux/download-cpp-client.sh /tmp/download-cpp-client.sh
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