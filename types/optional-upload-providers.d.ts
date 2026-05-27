declare module 'cloudinary' {
  export const v2: {
    config(options: {
      cloud_name?: string;
      api_key?: string;
      api_secret?: string;
    }): void;
    uploader: {
      upload_stream(
        options: Record<string, unknown>,
        callback: (error: unknown, result?: { secure_url?: string }) => void
      ): { end(buffer: Buffer): void };
      destroy(publicId: string): Promise<unknown>;
    };
  };
}

declare module '@netlify/blobs' {
  export function getStore(name: string): {
    set(
      key: string,
      value: ArrayBuffer,
      options?: {
        metadata?: Record<string, string | undefined>;
      }
    ): Promise<void>;
    delete(key: string): Promise<void>;
  };
}

declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: Record<string, unknown>);
    send(command: unknown): Promise<unknown>;
  }

  export class PutObjectCommand {
    constructor(input: Record<string, unknown>);
  }

  export class DeleteObjectCommand {
    constructor(input: Record<string, unknown>);
  }
}