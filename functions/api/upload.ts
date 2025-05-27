import { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  BUCKET: {
    put: (key: string, value: ReadableStream, options?: { httpMetadata?: { contentType: string } }) => Promise<void>;
  };
  R2_PUBLIC_DOMAIN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('Function triggered. Environment variables:', JSON.stringify(context.env));
  try {
    const formData = await context.request.formData();
    const image = formData.get('image');
    
    if (!image || !(image instanceof File)) {
      return new Response('No image provided', { status: 400 });
    }

    // 验证文件类型
    if (!image.type.startsWith('image/')) {
      return new Response('Invalid file type', { status: 400 });
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = image.name.split('.').pop() || 'jpg';
    const key = `${timestamp}-${randomString}.${extension}`;

    // 上传到 R2
    await context.env.BUCKET.put(key, image.stream(), {
      httpMetadata: {
        contentType: image.type,
      },
    });

    // 检查是否配置了公共域名
    if (!context.env.R2_PUBLIC_DOMAIN) {
      throw new Error('R2_PUBLIC_DOMAIN environment variable is not configured');
    }

    // 使用环境变量中的公共域名构建 URL
    const url = `https://${context.env.R2_PUBLIC_DOMAIN}/${key}`;

    return Response.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(error instanceof Error ? error.message : 'Internal Server Error', { 
      status: 500 
    });
  }
}; 