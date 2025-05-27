import { R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface Env {
    BUCKET_BUCKET: R2Bucket;
    R2_PUBLIC_DOMAIN: string;
  }
} 