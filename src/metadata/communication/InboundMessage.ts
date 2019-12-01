export interface InboundMessage {
    message: string;
    topic: string;
    partition?: number;
    key?: string;
    timestamp?: number;
}
