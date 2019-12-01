
import { KafkaBroker } from "./KafkaBroker";
import { KafkaTopic } from "./KafkaTopic";

export interface KafkaMetadata {
    orig_broker_id: number;
    orig_broker_name: string;
    brokers: KafkaBroker[];
    topics: KafkaTopic[];
}
