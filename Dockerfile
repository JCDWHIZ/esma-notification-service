# Build stage
FROM node:20-bullseye AS build

WORKDIR /app

# 1. Install Pulsar C++ client
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -qO - https://archive.apache.org/dist/pulsar/KEYS | apt-key add - && \
    echo "deb https://archive.apache.org/dist/pulsar/pulsar-3.4.2/DEB/ ./" > /etc/apt/sources.list.d/pulsar.list && \
    apt-get update && \
    apt-get install -y libpulsar-dev

# 2. Install Node.js dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 3. Copy source and build
COPY . .
RUN npx tsc

# Runtime stage
FROM node:20-bullseye AS runtime

WORKDIR /app

# 1. Install Pulsar C++ client (MUST match build stage version)
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -qO - https://archive.apache.org/dist/pulsar/KEYS | apt-key add - && \
    echo "deb https://archive.apache.org/dist/pulsar/pulsar-3.4.2/DEB/ ./" > /etc/apt/sources.list.d/pulsar.list && \
    apt-get update && \
    apt-get install -y libpulsar-dev

# 2. Copy built files
COPY --from=build /app .

EXPOSE 6072
CMD ["npm", "run", "dev"]