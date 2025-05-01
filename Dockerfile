# Build stage
FROM node:20-bullseye AS build

WORKDIR /app

# 1. Install Pulsar C++ client dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    rm -rf /var/lib/apt/lists/*

# 2. Add Pulsar repository (for 3.4.2)
RUN wget -qO - https://archive.apache.org/dist/pulsar/KEYS | gpg --dearmor > /usr/share/keyrings/apache-pulsar.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/apache-pulsar.gpg] https://archive.apache.org/dist/pulsar/pulsar-client-cpp-3.4.2/deb-x86_64/ /" > /etc/apt/sources.list.d/pulsar.list

# 3. Install Pulsar client (both runtime and dev packages)
RUN apt-get update && \
    apt-get install -y libpulsar-dev libpulsar3 && \
    rm -rf /var/lib/apt/lists/*

# 4. Install Node.js dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 5. Build TypeScript
COPY . .
RUN npx tsc

# Runtime stage
FROM node:20-bullseye AS runtime

WORKDIR /app

# 1. Install runtime dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    rm -rf /var/lib/apt/lists/*

# 2. Add Pulsar repository (MUST match build stage version)
RUN wget -qO - https://archive.apache.org/dist/pulsar/KEYS | gpg --dearmor > /usr/share/keyrings/apache-pulsar.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/apache-pulsar.gpg] https://archive.apache.org/dist/pulsar/pulsar-client-cpp-3.4.2/deb-x86_64/ /" > /etc/apt/sources.list.d/pulsar.list

# 3. Install runtime Pulsar library
RUN apt-get update && \
    apt-get install -y libpulsar3 && \
    rm -rf /var/lib/apt/lists/*

# 4. Copy built application
COPY --from=build /app .

EXPOSE 6072
CMD ["npm", "run", "dev"]