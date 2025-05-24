interface Env {
  BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/upload') {
      try {
        const formData = await request.formData();
        const image = formData.get('image') as File;
        
        if (!image) {
          return new Response('No image provided', { status: 400 });
        }

        const buffer = await image.arrayBuffer();
        const key = `${Date.now()}-${image.name}`;

        await env.BUCKET.put(key, buffer, {
          httpMetadata: {
            contentType: image.type,
          },
        });

        const imageUrl = `https://${url.hostname}/image/${key}`;

        return new Response(JSON.stringify({ url: imageUrl }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response('Upload failed', { status: 500 });
      }
    }

    if (request.method === 'GET' && url.pathname.startsWith('/image/')) {
      const key = url.pathname.replace('/image/', '');
      const object = await env.BUCKET.get(key);

      if (!object) {
        return new Response('Image not found', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(object.body, {
        headers,
      });
    }

    return new Response('Not found', { status: 404 });
  },
}; 