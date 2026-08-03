// Vercel Serverless Function for generating image
import type { IncomingMessage, ServerResponse } from 'http';
type VercelRequest = IncomingMessage & { body: any; query: any; method: string };
type VercelResponse = ServerResponse & { status: (code: number) => VercelResponse; json: (data: any) => void; send: (data: any) => void; setHeader: (name: string, value: string) => void; }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, image, model = 'doubao-seedream-4-5-251128' } = req.body;
  if (!prompt || !image) {
    return res.status(400).json({ error: 'Missing prompt or image' });
  }

  const arkApiKey = process.env.ARK_API_KEY;
  if (!arkApiKey) {
    return res.status(500).json({ error: 'Missing ARK API Key in environment variables' });
  }

  try {
    const requestBody: any = {
      model,
      prompt,
      response_format: 'url',
      size: '2K',
      stream: false,
      watermark: false,
      sequential_image_generation: 'disabled',
    };

    // 处理单图和多图情况
    if (Array.isArray(image)) {
      requestBody.image = image;
    } else {
      requestBody.image = image;
    }

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${arkApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const firstImage = data.data[0];

      if (firstImage.url) {
        return res.status(200).json({ imageUrl: firstImage.url });
      } else if (firstImage.error) {
        return res.status(500).json({ error: firstImage.error.message });
      } else {
        return res.status(500).json({ error: 'Invalid response format' });
      }
    } else {
      return res.status(500).json({ error: 'Invalid response format' });
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
}
