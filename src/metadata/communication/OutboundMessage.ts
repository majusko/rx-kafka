export interface OutboundMessage {
  value: Buffer; // message contents as a Buffer
  size: number; // size of the message, in bytes
  topic: string; // topic the message comes from
  offset: number; // offset the message was read from
  partition: number; // partition the message was on
  key: string; // key of the message if present
  timestamp: number; // timestamp of message creation
}
