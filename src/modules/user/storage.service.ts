import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { storageConfig } from "../../config/storage.config";

const s3Client = new S3Client({
  endpoint: storageConfig.endpoint,
  region: storageConfig.region,
  credentials: {
    accessKeyId: storageConfig.accessKey,
    secretAccessKey: storageConfig.secretKey,
  },
  forcePathStyle: storageConfig.forcePathStyle,
});

export class StorageService {
  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    const extension = path.extname(file.originalname) || ".jpg";

    const key = `avatars/${userId}/${uuidv4()}${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: storageConfig.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${storageConfig.publicUrl}/${key}`;
  }

  async deleteFileByUrl(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    if (!fileUrl.startsWith(storageConfig.publicUrl)) return;

    const key = fileUrl.replace(`${storageConfig.publicUrl}/`, "");

    if (!key) return;

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: storageConfig.bucketName,
        Key: key,
      }),
    );
  }
}
