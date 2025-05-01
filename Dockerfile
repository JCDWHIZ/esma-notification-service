# ────────────── Build stage ──────────────
FROM --platform=$BUILDPLATFORM node:20-bullseye AS build

WORKDIR /app

# 1) Install build toolchain + native-deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential cmake git bash \
      libssl-dev libprotobuf-dev libcurl4-openssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 2) Install your JS deps (will also fetch pulsar-client)
COPY package.json package-lock.json ./
RUN npm ci

# 3) Pull down the Pulsar C++ client (so our .node binds have libs to link against)
RUN cd node_modules/pulsar-client/pkg/linux && \
    bash download-cpp-client.sh

# 4) Force a rebuild of the native addon against those freshly downloaded C++ libs
RUN npm rebuild pulsar-client --build-from-source

# 5) Copy your source & compile TS
COPY . .
RUN npx tsc


# ────────────── Runtime stage ──────────────
FROM --platform=$TARGETPLATFORM node:20-bullseye AS runtime

WORKDIR /app

# 6) Only keep minimal runtime bits
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 7) Pull in everything from the build stage (includes node_modules + compiled JS + Pulsar libs)
COPY --from=build /app ./

EXPOSE 6072

# 8) Start in “dev” mode (or swap to your prod start command)
CMD ["npm", "run", "dev"]
