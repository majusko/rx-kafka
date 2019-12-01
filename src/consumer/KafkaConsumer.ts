import debugInit = require("debug");
import Kafka = require("node-rdkafka");
import { BehaviorSubject, Observable, Observer } from "rxjs";
import { filter } from "rxjs/operators";
import { MetadataConfig, WatermarkOffsetsConfig } from "../metadata/configuration";
import { KafkaError } from "../metadata/error";
import { KafkaMetadata, KafkaWatermarkOffsets } from "../metadata/kafka";
const debug = debugInit("rxkafka:KafkaConsumer");

export class KafkaConsumer<T> {

    private connectionSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(protected consumer: Kafka.KafkaConsumer) { }

    public isConnected() {
        return this.connectionSubject.asObservable();
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

    protected onReady(topic: string[]) {
        this.connectionSubject.next(true);
        this.consumer.subscribe(topic);
        this.consumer.consume();

        debug("Consumer ready to consume topic %s", topic);
    }

    protected onDebug(debugLog: any) {
        debug("Consumer debug: %O", debugLog);
    }

    protected onDisconected(arg: any) {
        this.connectionSubject.next(false);
        debug("Consumer disconnected: %O", arg);
    }

    protected onFail(observer: Observer<T>) {
        this.connectionSubject.next(false);
        debug("Consumer connecion failure");
        observer.error(new Error("Consumer connecion failure"));
    }

    protected onError(observer: Observer<T>, error: KafkaError) {
        debug("Error: %O", error);
        observer.error(error);
    }

    protected onUnsubscribe(eventsToRemove: string[]) {
        debug("KafkaConsumer unsubscribed");

        this.consumer.disconnect();

        eventsToRemove.forEach((event) => {
            this.consumer.removeAllListeners(event);
        });
    }

    private getMetadata(metadataSubject: BehaviorSubject<KafkaMetadata>, config: MetadataConfig) {
        this.consumer.getMetadata(config, (error, metadata) => {
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
        this.consumer.queryWatermarkOffsets(config.topic, config.partition, config.timeout, (error, offsets: KafkaWatermarkOffsets) => {
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
}
