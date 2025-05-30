import { PagesFunction, R2Bucket } from '@cloudflare/workers-types';

interface Env {
  BUCKET_BUCKET: R2Bucket;
  R2_PUBLIC_DOMAIN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('Function triggered. Environment variables:', JSON.stringify(context.env));

  // 检查 R2 存储桶绑定
  const bucket = context.env.BUCKET_BUCKET as unknown as R2Bucket;
  if (!bucket || typeof bucket.put !== 'function') {
    return Response.json(
      {
        message: "Upload failed because R2 bucket binding is not properly configured. Please check your R2 bucket binding in Cloudflare Pages settings.",
        environment: context.env,
        bucketType: typeof bucket,
        hasPutMethod: bucket ? typeof bucket.put === 'function' : false,
        bucketKeys: bucket ? Object.keys(bucket) : []
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const formData = await context.request.formData();
    const image = formData.get('image') as File | null;
    
    if (!image) {
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
    const buffer = await image.arrayBuffer();
    await bucket.put(key, buffer, {
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