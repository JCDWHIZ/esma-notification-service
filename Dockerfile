# Build stage
FROM node:20-bullseye AS build

WORKDIR /app

# Install Pulsar C++ client
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -qO - https://downloads.apache.org/pulsar/KEYS | gpg --dearmor > /usr/share/keyrings/apache-pulsar.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/apache-pulsar.gpg] https://archive.apache.org/dist/pulsar/pulsar-client-cpp-3.4.2/deb-arm64/ /" > /etc/apt/sources.list.d/pulsar.list && \
    apt-get update && \
    apt-get install -y libpulsar-dev libpulsar-with-deps && \
    rm -rf /var/lib/apt/lists/*

# Rest of build steps...

# Runtime stage
FROM node:20-bullseye AS runtime

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -qO - https://downloads.apache.org/pulsar/KEYS | gpg --dearmor > /usr/share/keyrings/apache-pulsar.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/apache-pulsar.gpg] https://archive.apache.org/dist/pulsar/pulsar-client-cpp-3.4.2/deb-arm64/ /" > /etc/apt/sources.list.d/pulsar.list && \
    apt-get update && \
    apt-get install -y libpulsar && \
    rm -rf /var/lib/apt/lists/*

# Rest of runtime steps...

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
EXPOSE 6072

CMD ["npm", "run", "dev"]
