import "dotenv/config";

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const storageConfig = {
  endpoint: requiredEnv("S3_ENDPOINT"),
  region: process.env.S3_REGION || "us-east-1",
  bucketName: requiredEnv("S3_BUCKET_NAME"),
  accessKey: requiredEnv("S3_ACCESS_KEY"),
  secretKey: requiredEnv("S3_SECRET_KEY"),
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  publicUrl: requiredEnv("S3_PUBLIC_URL"),
};
