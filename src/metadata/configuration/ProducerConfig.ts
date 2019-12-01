
import { BaseConfig } from "./BaseConfig";
/**
 * Docs: https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md
 */
export interface ProducerConfig extends BaseConfig {
    "metadata.broker.list": string;
    bufferSize?: number;
}
