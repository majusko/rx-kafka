
import { KafkaPartition } from "./KafkaPartition";

export interface KafkaTopic {
    name: string;
    partitions: KafkaPartition[];
}
