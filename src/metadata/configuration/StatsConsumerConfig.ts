
import { ConsumerConfig } from "./ConsumerConfig";
/**
 * Docs: https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md
 */
export interface StatsConsumerConfig extends ConsumerConfig {
    "statistics.interval.ms": number;
}
