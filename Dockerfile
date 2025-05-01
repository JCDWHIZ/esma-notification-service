# Build stage
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

# 1. Install Pulsar C++ client dependencies
RUN apt-get update && apt-get install -y wget libssl-dev

# 2. Download & Install Pulsar C++ client
RUN wget -q https://archive.apache.org/dist/pulsar/pulsar-client-cpp-3.4.2/apache-pulsar-client-dev.deb \
    && dpkg -i apache-pulsar-client-dev.deb

# 3. Install Node.js dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 4. Copy source and build
COPY . .
RUN npx tsc

# Runtime stage
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime

WORKDIR /app

# 1. Install Pulsar C++ client dependencies
RUN apt-get update && apt-get install -y wget libssl-dev

# 2. Install Pulsar C++ client (MUST match build stage version)
RUN wget -q https://archive.apache.org/dist/pulsar/pulsar-client-cpp-3.4.2/apache-pulsar-client-dev.deb \
    && dpkg -i apache-pulsar-client-dev.deb

# 3. Copy ONLY build artifacts from build stage
COPY --from=build /app .

EXPOSE 6072
CMD ["npm", "run", "dev"]