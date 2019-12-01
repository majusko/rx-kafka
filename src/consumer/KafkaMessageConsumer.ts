import debugInit = require("debug");
import Kafka = require("node-rdkafka");
import {Observable, Observer} from "rxjs";
import {OutboundMessage} from "../metadata/communication";
import {KafkaStats} from "../metadata/communication";
import {ConsumerConfig, MetadataOptions, TopicConfig} from "../metadata/configuration";
import {KafkaError, StatsError} from "../metadata/error";
import {KafkaConsumer} from "./KafkaConsumer";

const debug = debugInit("rxkafka:KafkaMessageConsumer");

export class KafkaMessageConsumer extends KafkaConsumer<OutboundMessage> {

    constructor(configuration: ConsumerConfig, topicConfiguration: TopicConfig) {
        super(new Kafka.KafkaConsumer(configuration, topicConfiguration));
    }

    public connect(topics: string[]) {
        return new Observable<OutboundMessage>((observer: Observer<OutboundMessage>) => {

            const onEventStats = (stats: KafkaStats) => {
                debug("ERROR: Create separate consumer for stats.");
                observer.error(new StatsError("Subscribing to stats is not allowed here. Create separate consumer for stats."));
            };

            const onData = (message: OutboundMessage) => {
                debug("KafkaMessage %O", message);
                observer.next(message);
            };

            this.consumer
                .on("ready", () => this.onReady(topics))
                .on("event.log", (debugLog) => this.onDebug(debugLog))
                .on("disconnected", (arg) => this.onDisconected(arg))
                .on("data", onData)
                .on("event.error", (error: KafkaError) => {
                    this.onError(observer, error);
                })
                .on("connection.failure", () => {
                    this.onFail(observer);
                })
                .on("event.stats", onEventStats);

            this.consumer.connect(new MetadataOptions());

            return () => {
                this.onUnsubscribe(["ready", "event.log", "disconnected", "data", "event.stats", "event.error", "connection.failure"]);
            };
        });
    }
}
