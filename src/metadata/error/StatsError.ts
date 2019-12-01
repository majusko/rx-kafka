import { KafkaError } from "./KafkaError";

export class StatsError implements KafkaError {
    constructor(public message: string) {
    }
}
