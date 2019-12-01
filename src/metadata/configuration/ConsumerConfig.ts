
import { BaseConfig } from "./BaseConfig";
/**
 * Docs: https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md
 */
export interface ConsumerConfig extends BaseConfig {
    "group.id": string;
    "metadata.broker.list": string;
}
