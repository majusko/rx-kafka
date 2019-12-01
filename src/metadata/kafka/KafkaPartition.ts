
export interface KafkaPartition {
    id: number;
    leader: number;
    replicas: number[];
    isrs: number[];
}
