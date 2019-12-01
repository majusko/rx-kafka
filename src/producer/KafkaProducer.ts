import debugInit = require("debug");
import Kafka = require("node-rdkafka");
import {BehaviorSubject, Observable, Observer, ReplaySubject, Subscription} from "rxjs";
import {filter, switchMap, tap} from "rxjs/operators";

import {InboundMessage} from "../metadata/communication";
import {MetadataConfig, MetadataOptions, ProducerConfig, TopicConfig, WatermarkOffsetsConfig} from "../metadata/configuration";
import {ErrorReason, KafkaReasonedError} from "../metadata/error";
import {KafkaMetadata, KafkaWatermarkOffsets} from "../metadata/kafka";

const debug = debugInit("rxkafka:KafkaProducer");

export class KafkaProducer {

    private readonly producer: Kafka.Producer;
    private readonly subscription: Subscription;

    private input: ReplaySubject<InboundMessage>;
    private connectionSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(configuration: ProducerConfig, topicConfiguration: TopicConfig) {
        this.input = new ReplaySubject(configuration.bufferSize ? configuration.bufferSize : 10000);
        this.producer = new Kafka.Producer(configuration, topicConfiguration);
        this.subscription = this.registerSubject();
    }

    public isConnected() {
        return this.connectionSubject.asObservable();
    }

    public send(message: InboundMessage) {
        message.partition = message.partition ? message.partition : null;
        this.input.next(message);
    }

    public metadata(config: MetadataConfig): Observable<KafkaMetadata> {
        const metadataSubject: BehaviorSubject<KafkaMetadata> = new BehaviorSubject(null);
        this.isConnected().pipe(filter(($) => $)).subscribe((next) => this.getMetadata(metadataSubject, config),
            (error) => {
                debug("Error while subscribing to connectionSubject: %O", error);
                metadataSubject.error(error);
            });

        return metadataSubject.asObservable();
    }

    public watermarkOffsets(config: WatermarkOffsetsConfig): Observable<KafkaWatermarkOffsets> {
        const watermarkOffsetsSubject: BehaviorSubject<KafkaWatermarkOffsets> = new BehaviorSubject(null);
        this.isConnected().pipe(filter(($) => $)).subscribe((next) => this.getWaterMarkOffsets(watermarkOffsetsSubject, config),
            (error) => {
                debug("Error while subscribing to connectionSubject: %O", error);
                watermarkOffsetsSubject.error(error);
            });

        return watermarkOffsetsSubject.asObservable();
    }

    public disconnect() {
        if (this.subscription != null) {
            this.subscription.unsubscribe();
        }
        this.close();
    }

    private getMetadata(metadataSubject: BehaviorSubject<KafkaMetadata>, config: MetadataConfig) {
        this.producer.getMetadata(config, (error, metadata) => {
            if (error) {
                debug("Error while getting KafkaConsumer metadata: %O", error);
                metadataSubject.error(error);
            } else {
                debug("Got metadata: %O", metadata);
                metadataSubject.next(metadata);
                metadataSubject.complete();
            }
        });
    }

    private getWaterMarkOffsets(metadataSubject: BehaviorSubject<KafkaWatermarkOffsets>, config: WatermarkOffsetsConfig) {
        this.producer.queryWatermarkOffsets(config.topic, config.partition, config.timeout, (error, offsets: KafkaWatermarkOffsets) => {
            if (error) {
                debug("Error while getting KafkaConsumer metadata: %O", error);
                metadataSubject.error(error);
            } else {
                debug("Got offsets: %O", offsets);
                metadataSubject.next(offsets);
                metadataSubject.complete();
            }
        });
    }

    private registerSubject() {
        debug("Registering Subject");
        return this.connect().pipe(switchMap(() => this.input.pipe(tap((message) => this.produce(message)))))
            .subscribe({
                error: (error: KafkaReasonedError) => {
                    this.close(error);
                    if (error.reason === ErrorReason.Disconnected) {
                        throw new Error("Kafka is disconnected!");
                    }
                },
            });
    }

    private produce(message: InboundMessage) {
        try {
            this.producer.produce(
                message.topic,
                message.partition,
                new Buffer(message.message),
                message.key,
                message.timestamp,
            );
        } catch (error) {
            debug("A problem occurred when sending our message: %O", error);
        }
    }

    private close(error?: KafkaReasonedError) {
        debug(error.reason.toString());
        if (this.producer != null) {
            this.isConnected().pipe(filter(($) => $)).subscribe((next) => this.producer.disconnect());
            this.producer.removeAllListeners();
        }
    }

    private connect(options: MetadataOptions = new MetadataOptions()) {
        return new Observable<boolean>((observer: Observer<boolean>) => {
            this.registerEventHandlers(observer);
            this.producer.connect(options);

            return this.close;
        });
    }

    private registerEventHandlers(observer: Observer<boolean>) {
        if (this.producer === null) {
            throw new Error("Producer is not initialized.");
        }
        this.producer
            .on("ready", (topic: string) => this.onReady(topic, observer))
            .on("disconnected", () => this.onDisconnected(observer))
            .on("connection.failure", () => this.onConnectionFailure(observer))
            .on("event.error", (error) => this.onError(error, observer))
            .on("event.throttle", () => debug("Producer is throttling."));
    }

    private onReady(topic: string, observer: Observer<boolean>) {
        debug("Producer is connected to topic: %s.", topic);
        this.connectionSubject.next(true);
        observer.next(true);
    }

    private onDisconnected(observer: Observer<boolean>) {
        this.connectionSubject.next(false);
        debug("Producer is disconnected.");
        observer.error(new KafkaReasonedError(ErrorReason.Disconnected));
    }

    private onConnectionFailure(observer: Observer<boolean>) {
        this.connectionSubject.next(false);
        debug("Producer connection failure");
        observer.error(new KafkaReasonedError(ErrorReason.Disconnected));
    }

    private onError(error: any, observer: Observer<boolean>) {
        debug("Unknown error from kafka.");
        observer.error(new KafkaReasonedError(ErrorReason.Unknown, error));
    }
}
