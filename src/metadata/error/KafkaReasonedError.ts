
import { ErrorReason } from "./ErrorReason";
import { KafkaError } from "./KafkaError";

export class KafkaReasonedError implements KafkaError {
    constructor(public reason: ErrorReason, public error?: any) {
    }
}
