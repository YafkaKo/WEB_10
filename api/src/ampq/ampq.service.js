import amqplib from 'amqplib';

export class AmpqProvider {
    static connection = null;
    static channels = new Map(); // Лучше использовать Map
ko
    static async connect(config) {
        try {
            this.connection = await amqplib.connect({
                ...config,
                heartbeat: 30, // Keepalive
            });
            console.log('Successfully connected to AMPQ')
            this.connection.on('close', () => this.reconnect(config));
        } catch (err) {
            console.error('Connection failed:', err);
            throw err;
        }
    }

    static async getChannel(queueName) {
        if (!this.connection) throw new Error('Not connected to RabbitMQ');

        if (!this.channels.has(queueName)) {
            const channel = await this.connection.createChannel();
            await channel.assertQueue(queueName, { durable: true });
            channel.prefetch(1); // Ограничиваем параллелизм
            this.channels.set(queueName, channel);
        }
        return this.channels.get(queueName);
    }

    static async sendEventToTheQueue(queueName, payload) {
        const channel = await this.getChannel(queueName);
        const message = JSON.stringify(payload); // Лучше JSON для совместимости

        await channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
    }

    static async subscribeToEvent(queueName, handler) {
        const channel = await this.getChannel(queueName);

        channel.consume(queueName, async (msg) => {
            if (!msg) return;

            try {
                const payload = JSON.parse(msg.content.toString());
                await handler(payload);
                channel.ack(msg);
            } catch (err) {
                console.error('Handler failed:', err);
                channel.nack(msg, false, true); // Возвращаем в очередь
            }
        });
    }
}