import 'dotenv/config'

export const storageConfig = {
    host: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
    region: process.env.MINIO_REGION,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
};