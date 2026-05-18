import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = configService.get<string>('AWS_S3_ENDPOINT');
    this.client = new S3Client({
      region: configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
      ...(endpoint && { endpoint, forcePathStyle: true }), // MinIO는 path style 필요
    });
    this.bucket = configService.getOrThrow<string>('AWS_S3_BUCKET');
  }

  async getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 300 }); // 5분
  }

  getPublicUrl(key: string): string {
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    if (endpoint) {
      return `${endpoint}/${this.bucket}/${key}`; // MinIO
    }
    return `https://${this.bucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`; // AWS S3
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
