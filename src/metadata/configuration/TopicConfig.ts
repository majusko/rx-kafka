
/**
 * Docs: https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md
 */
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
