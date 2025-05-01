# Build stage
FROM node:20-bullseye AS build

WORKDIR /app

# 1. Install dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    rm -rf /var/lib/apt/lists/*

# 2. Add Pulsar repository (CORRECTED PATH)
RUN wget -qO - https://downloads.apache.org/pulsar/KEYS | gpg --dearmor > /usr/share/keyrings/apache-pulsar.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/apache-pulsar.gpg] https://archive.apache.org/dist/pulsar/pulsar-3.4.2/DEB/ /" > /etc/apt/sources.list.d/pulsar.list

# 3. Install Pulsar client (version-specific packages)
RUN apt-get update && \
    apt-get install -y libpulsar-dev=3.4.2-1 libpulsar=3.4.2-1 && \
    rm -rf /var/lib/apt/lists/*

# 4. Install Node.js dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 5. Build application
COPY . .
RUN npx tsc

# Runtime stage
FROM node:20-bullseye AS runtime

WORKDIR /app

# 1. Add Pulsar repository (same as build stage)
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    rm -rf /var/lib/apt/lists/*

RUN wget -qO - https://downloads.apache.org/pulsar/KEYS | gpg --dearmor > /usr/share/keyrings/apache-pulsar.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/apache-pulsar.gpg] https://archive.apache.org/dist/pulsar/pulsar-3.4.2/DEB/ /" > /etc/apt/sources.list.d/pulsar.list

# 2. Install runtime dependencies
RUN apt-get update && \
    apt-get install -y libpulsar=3.4.2-1 && \
    rm -rf /var/lib/apt/lists/*

# 3. Copy built application
COPY --from=build /app .

EXPOSE 6072
CMD ["npm", "run", "dev"]