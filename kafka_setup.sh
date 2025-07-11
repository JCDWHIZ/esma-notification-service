#!/bin/bash

# Kafka Podman Setup Script
# This script sets up Kafka with Zookeeper using Podman

echo "🚀 Setting up Kafka with Podman..."

# Create a network for Kafka services
echo "📡 Creating Podman network..."
podman network create kafka-network --driver bridge

# Start Zookeeper
echo "🐘 Starting Zookeeper..."
podman run -d \
  --name zookeeper \
  --network kafka-network \
  -p 2181:2181 \
  -e ZOOKEEPER_CLIENT_PORT=2181 \
  -e ZOOKEEPER_TICK_TIME=2000 \
  -e ZOOKEEPER_SYNC_LIMIT=2 \
  confluentinc/cp-zookeeper:7.4.0

# Wait for Zookeeper to start
echo "⏳ Waiting for Zookeeper to start..."
sleep 10

# Start Kafka
echo "🚀 Starting Kafka..."
podman run -d \
  --name kafka \
  --network kafka-network \
  -p 9092:9092 \
  -p 9101:9101 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
  -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
  -e KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0 \
  -e KAFKA_JMX_PORT=9101 \
  -e KAFKA_JMX_HOSTNAME=localhost \
  -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
  confluentinc/cp-kafka:7.4.0

# Wait for Kafka to start
echo "⏳ Waiting for Kafka to start..."
sleep 20

# Check if containers are running
echo "🔍 Checking container status..."
podman ps --filter "name=zookeeper" --filter "name=kafka"

# Test Kafka connection
echo "🧪 Testing Kafka connection..."
podman exec kafka kafka-topics --create --topic test-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

if [ $? -eq 0 ]; then
  echo "✅ Kafka is running successfully!"
  echo "📝 Your .env file should contain:"
  echo "KAFKA_BROKERS=localhost:9092"
  echo ""
  echo "🎯 Available services:"
  echo "  - Kafka: localhost:9092"
  echo "  - Zookeeper: localhost:2181"
  echo "  - JMX: localhost:9101"
else
  echo "❌ Kafka setup failed!"
  exit 1
fi

echo ""
echo "🛠️  Management commands:"
echo "  Stop services:    podman stop kafka zookeeper"
echo "  Start services:   podman start zookeeper && sleep 5 && podman start kafka"
echo "  Remove services:  podman rm -f kafka zookeeper"
echo "  Remove network:   podman network rm kafka-network"
echo "  View logs:        podman logs kafka"