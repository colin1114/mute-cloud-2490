import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  BUCKET_BUCKET: R2Bucket;
  R2_PUBLIC_DOMAIN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 处理 API 请求
    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/upload') {
        try {
          console.log('开始处理上传请求');
          const formData = await request.formData();
          const image = formData.get('image') as File;
          
          if (!image) {
            console.error('没有找到图片文件');
            return new Response('No image provided', { status: 400 });
          }

          console.log('接收到图片:', image.name, image.type, image.size);

          if (!image.type.startsWith('image/')) {
            console.error('文件类型不正确:', image.type);
            return new Response('Invalid file type. Only images are allowed.', { status: 400 });
          }

          const buffer = await image.arrayBuffer();
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = image.name.split('.').pop() || 'jpg';
          const key = `${timestamp}-${randomString}.${extension}`;

          console.log('开始上传到 R2:', key);
          await env.BUCKET_BUCKET.put(key, buffer, {
            httpMetadata: {
              contentType: image.type,
            },
          });
          console.log('R2 上传完成');

          // 使用 R2 公共域名构建 URL
          const imageUrl = `https://${env.R2_PUBLIC_DOMAIN}/${key}`;
          console.log('生成的图片 URL:', imageUrl);

          return new Response(JSON.stringify({ url: imageUrl }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('上传处理错误:', error);
          const errorMessage = error instanceof Error ? error.message : '上传失败';
          return new Response(
            JSON.stringify({ error: '上传失败', details: errorMessage }), 
            { 
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            }
          );
        }
      }

      if (request.method === 'GET' && url.pathname.startsWith('/image/')) {
        try {
          const key = url.pathname.replace('/image/', '');
          console.log('获取图片:', key);
          const object = await env.BUCKET_BUCKET.get(key);

          if (!object) {
            console.error('图片未找到:', key);
            return new Response('Image not found', { status: 404 });
          }

          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Access-Control-Allow-Origin', '*');

          const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
          console.log('返回图片:', key, object.size, contentType);

          return new Response(object.body, {
            headers,
          });
        } catch (error) {
          console.error('获取图片错误:', error);
          return new Response('Error fetching image', { status: 500 });
        }
      }
    }

    // 返回 404 响应，让 Pages 平台处理静态资产
    return new Response('Not found', { status: 404 });
  },
}; 