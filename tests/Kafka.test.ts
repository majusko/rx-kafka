import debugInit = require("debug");
import "mocha";
import {KafkaMessageConsumer} from "../src/consumer";
import {KafkaProducer} from "../src/producer";

const debug = debugInit("tests:consumer");

describe("Kafka test", () => {

    it("sending and consuming messages from kafka and also getting watermark offsets and metadata", (done) => {
        // this.timeout(10000);
        const consumer = new KafkaMessageConsumer({"metadata.broker.list": "localhost:9092", "group.id": "kafka"}, {});
        const producer = new KafkaProducer({"metadata.broker.list": "localhost:9092"}, {});

        // let consumed = false;
        consumer.connect(["ma-topic"]).subscribe((next) => {
            debug("My message: %O", next);
            const messageValue = next.value.toString();

            if (messageValue === "testing4") {
                producer.disconnect();
                done();
            }
        }, (error) => {
            debug("My error: %O", error);
        });

        consumer.metadata({topic: "ma-topic", timeout: 5000}).subscribe((data) => {
            debug("My consumer metadata: %O", data);
        }, (error) => {
            debug("My error: %O", error);
        });

        consumer.watermarkOffsets({topic: "ma-topic", timeout: 5000, partition: 1}).subscribe((data) => {
            debug("My consumer offset: %O", data);
        }, (error) => {
            debug("My error: %O", error);
        });

        producer.metadata({topic: "ma-topic", timeout: 5000}).subscribe((data) => {
            debug("My producer metadata: %O", data);
        }, (error) => {
            debug("My error: %O", error);
        });

        producer.watermarkOffsets({topic: "ma-topic", timeout: 5000, partition: 1}).subscribe((data) => {
            debug("My producer offset: %O", data);
        }, (error) => {
            debug("My error: %O", error);
        });

        producer.send({topic: "ma-topic", message: "testing1", partition: null});
        producer.send({topic: "ma-topic", message: "testing2", partition: null});
        producer.send({topic: "ma-topic", message: "testing3", partition: null});
        producer.send({topic: "ma-topic", message: "testing4", partition: null});

    }).timeout(10000);
});
