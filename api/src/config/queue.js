const queueConfig = {
    hostname: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD
}

export default queueConfig;