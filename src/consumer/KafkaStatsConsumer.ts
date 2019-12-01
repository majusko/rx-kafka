import debugInit = require("debug");
import Kafka = require("node-rdkafka");
import { Observable, Observer } from "rxjs";
import { KafkaStats } from "../metadata/communication/KafkaStats";
import { MetadataOptions, StatsConsumerConfig, TopicConfig } from "../metadata/configuration";
import { KafkaError } from "../metadata/error";
import { KafkaConsumer } from "./KafkaConsumer";

const debug = debugInit("rxkafka:KafkaStatsConsumer");

export class KafkaStatsConsumer extends KafkaConsumer<KafkaStats> {

    constructor(configuration: StatsConsumerConfig, topicConfiguration: TopicConfig) {
        if (configuration["statistics.interval.ms"] === 0) {
            throw new Error("statistics.interval.ms should be higher then 0.");
        }
        super(new Kafka.KafkaConsumer(configuration, topicConfiguration));
    }

    public connect(topic: string) {
        return Observable.create((observer: Observer<KafkaStats>) => {

            const onEventStats = (stats: KafkaStats) => {
                debug("Stats exported %O", stats);
                observer.next(stats);
            };

            this.consumer
                .on("ready", this.onReady)
                .on("event.log", this.onDebug)
                .on("disconnected", this.onDisconected)
                .on("event.stats", onEventStats)
                .on("event.error", (error: KafkaError) => { this.onError(observer, error); })
                .on("connection.failure", () => { this.onFail(observer); });

            this.consumer.connect(new MetadataOptions());

            return () => {
                this.onUnsubscribe(["ready", "event.log", "disconnected", "event.stats", "event.error", "connection.failure"]);
            };
        });
    }
}
