# ─── BUILD STAGE ───────────────────────────────────────────────────────────────
FROM node:20-bullseye AS build
WORKDIR /app

# 1️⃣ Install core build deps
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    git \
    libssl-dev \
    libcurl4-openssl-dev \
    libprotobuf-dev \
    protobuf-compiler \
    libboost-all-dev \
    python3 \
  && rm -rf /var/lib/apt/lists/*

# 2️⃣ Clone & build Pulsar C++ client (v2.10.2 as example; pin to your version)
ARG PULSAR_VERSION=2.10.2
RUN git clone --branch pulsar-${PULSAR_VERSION} --depth 1 \
      https://github.com/apache/pulsar.git /tmp/pulsar && \
    mkdir -p /tmp/pulsar/pulsar-client-cpp/build && \
    cd /tmp/pulsar/pulsar-client-cpp/build && \
    cmake -DCMAKE_INSTALL_PREFIX=/usr/local .. && \
    make -j$(nproc) install && \
    ldconfig && \
    rm -rf /tmp/pulsar

# 3️⃣ Copy package files & install Node binding
COPY package*.json ./
# Force build from source to bind against our freshly-installed C++ client
RUN npm install --build-from-source pulsar-client

# 4️⃣ Copy app code & transpile (if TS)
COPY . .
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
