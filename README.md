# RxKafka - Reactive wrapper for well known C++ kafka library [rdkafka](https://github.com/edenhill/librdkafka)

[![npm version](https://badge.fury.io/js/rxkafka.svg)](https://www.npmjs.com/package/rxkafka)
[![Build Status](https://travis-ci.com/majusko/rx-kafka.svg?branch=master)](https://travis-ci.com/majusko/rx-kafka)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/majusko/rx-kafka/blob/master/LICENSE.md)

- Extending great library [node rdkafka](https://github.com/LogNet/grpc-spring-boot-starter) with reactive RxJs extension. Easy implementation using a simple Subscriptions to well known Observables and subscriptions from [ReactiveX](http://reactivex.io/).
- Added [Typescript](https://www.typescriptlang.org/) for cleaner manipulation with API and configurations

## Quick Start

Simple start consist only from 3 steps.

#### 1. Install

```bash
npm i rxkafka
```

#### 2. Configure Producer

```typescript

const producer = new KafkaProducer({"metadata.broker.list": "localhost:9092"}, {});

producer.send({topic: "my-topic", message: "message"});

```

#### 3. Configure Consumer

```typescript

const consumer = new KafkaMessageConsumer({"metadata.broker.list": "localhost:9092", "group.id": "my-group"}, {});

consumer.connect(["my-topic"]).subscribe((next) => {
    console.log(next.value.toString());
}, (error) => {
    console.log(error);
});

```

## Documentation

Some other examples of using RxKafka library with all possibilities of configuration.

### Get watermark offset

```typescript

consumer.watermarkOffsets({topic: "my-topic", timeout: 5000, partition: 1}).subscribe((data) => {
    console.log("My offset:");
    console.log(data);
}, (error) => {
    console.log(error);
});

```

### Get Metadata

```typescript

consumer.metadata({topic: "my-topic", timeout: 5000}).subscribe((data) => {
    console.log("My producer metadata:");
    console.log(data);
}, (error) => {
    console.log(error);
});

```

### Configuration

You can setup same configuration as explained in [librdkafka configuration](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) using prepared interfaces for easier usage.

#### Topic configuration:
```typescript

export interface TopicConfig {
    "request.required.acks"?: number;
    "request.timeout.ms"?: number;
    "message.timeout.ms"?: number;
    "queuing.strategy"?: string;
    "produce.offset.report"?: boolean;
    "auto.commit.enable"?: boolean;
    "compression.codec"?: string;
    "auto.commit.interval.ms"?: number;
    "auto.offset.reset"?: string;
    "offset.store.path"?: string;
    "offset.store.sync.interval.ms"?: number;
    "offset.store.method"?: string;
    "consume.callback.max.messages"?: number;
}
```

#### Consumer configuration:
```typescript
export interface ConsumerConfig extends BaseConfig {
    "group.id": string;
    "metadata.broker.list": string;
}
```

#### Producer configuration:
```typescript
export interface ProducerConfig extends BaseConfig {
    "metadata.broker.list": string;
    bufferSize?: number;
}
```

#### Shared configuration for Producer and also Consumer:
```typescript

export interface BaseConfig {
    "group.id"?: string;
    "metadata.broker.list"?: string;
    "bootstrap.servers"?: string;
    "message.max.bytes"?: number;
    "message.copy.max.bytes"?: number;
    "receive.message.max.bytes"?: number;
    "max.in.flight.requests.per.connection"?: number;
    "max.in.flight"?: number;
    "metadata.request.timeout.ms"?: number;
    "topic.metadata.refresh.interval.ms"?: number;
    "metadata.max.age.ms"?: number;
    "topic.metadata.refresh.fast.interval.ms"?: number;
    "topic.metadata.refresh.sparse"?: boolean;
    "debug"?: string;
    "socket.timeout.ms"?: number;
    "socket.blocking.max.ms"?: number;
    "socket.send.buffer.bytes"?: number;
    "socket.receive.buffer.bytes"?: number;
    "socket.keepalive.enable"?: boolean;
    "socket.nagle.disable"?: boolean;
    "socket.max.fails"?: number;
    "broker.address.ttl"?: number;
    "broker.address.family"?: string;
    "reconnect.backoff.jitter.ms"?: number;
    "statistics.interval.ms"?: number;
    "enabled_events"?: number;
    "log_level"?: number;
    "log.queue"?: boolean;
    "log.thread.name"?: boolean;
    "log.connection.close"?: boolean;
    "internal.termination.signal"?: number;
    "api.version.request"?: boolean;
    "api.version.request.timeout.ms"?: number;
    "api.version.fallback.ms"?: number;
    "broker.version.fallback"?: string;
    "security.protocol"?: string;
    "ssl.cipher.suites"?: string;
    "ssl.curves.list"?: string;
    "ssl.key.location"?: string;
    "ssl.key.password"?: string;
    "ssl.certificate.location"?: string;
    "ssl.ca.location"?: string;
    "ssl.crl.location"?: string;
    "ssl.keystore.location"?: string;
    "ssl.keystore.password"?: string;
    "sasl.mechanisms"?: string;
    "sasl.mechanism"?: string;
    "sasl.kerberos.service.name"?: string;
    "sasl.kerberos.principal"?: string;
    "sasl.kerberos.kinit.cmd"?: string;
    "sasl.kerberos.keytab"?: string;
    "sasl.kerberos.min.time.before.relogin"?: number;
    "sasl.username"?: string;
    "sasl.password"?: string;
    "plugin.library.paths"?: string;
    "partition.assignment.strategy"?: string;
    "session.timeout.ms"?: number;
    "heartbeat.interval.ms"?: number;
    "group.protocol.type"?: string;
    "coordinator.query.interval.ms"?: number;
    "enable.auto.commit"?: boolean;
    "auto.commit.interval.ms"?: number;
    "enable.auto.offset.store"?: boolean;
    "queued.min.messages"?: number;
    "queued.max.messages.kbytes"?: number;
    "fetch.wait.max.ms"?: number;
    "fetch.message.max.bytes"?: number;
    "max.partition.fetch.bytes"?: number;
    "fetch.max.bytes"?: number;
    "fetch.min.bytes"?: number;
    "fetch.error.backoff.ms"?: number;
    "offset.store.method"?: number;
    "enable.partition.eof"?: boolean;
    "check.crcs"?: boolean;
    "queue.buffering.max.messages"?: number;
    "queue.buffering.max.kbytes"?: number;
    "queue.buffering.max.ms"?: number;
    "linger.ms"?: number;
    "message.send.max.retries"?: number;
    "retries"?: number;
    "retry.backoff.ms"?: number;
    "queue.buffering.backpressure.threshold"?: number;
    "compression.codec"?: string;
    "compression.type"?: string;
    "batch.num.messages"?: number;
    "delivery.report.only.error"?: boolean;
}
```

#### Metadata configuration:
```typescript
export interface MetadataConfig {
    timeout: number;
    topic: string;
}

```

#### Tatistics consumer configuration:
```typescript
export interface StatsConsumerConfig extends ConsumerConfig {
    "statistics.interval.ms": number;
}

```

## Run locally

Require git, docker

### 1. Clone dockerized kafka

```bash
git clone https://github.com/wurstmeister/kafka-docker.git
```

### 2. Configure file

Override two settings in `docker-compose-single-broker.yml`

```bash
KAFKA_ADVERTISED_HOST_NAME: 192.168.99.100
KAFKA_CREATE_TOPICS: "my-topic:1:1"
```

### 3. Run kafka as single broker

```bash
docker-compose -f docker-compose-single-broker.yml up -d
```

### 4. Edit integration test file

`KafkaIntegrationTests.test.ts`

Remove `skip` phase from tests (Skipped because of travis CI).

### 4. Execute tests

```bash
npm run test
```

## Contributing

All contributors are welcome. If you never contributed to the open-source, start with reading the [Github Flow](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/github-flow).

1. Create an [issue](https://help.github.com/en/github/managing-your-work-on-github/about-issues)
2. Create a [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests) with reference to the issue
3. Rest and enjoy the great feeling of being a contributor.
