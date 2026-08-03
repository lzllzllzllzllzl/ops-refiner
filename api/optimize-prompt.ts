// Vercel Serverless Function for optimizing prompt
import type { IncomingMessage, ServerResponse } from 'http';
type VercelRequest = IncomingMessage & { body: any; query: any; method: string };
type VercelResponse = ServerResponse & { status: (code: number) => VercelResponse; json: (data: any) => void; send: (data: any) => void; setHeader: (name: string, value: string) => void; }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const arkApiKey = process.env.ARK_API_KEY;
  if (!arkApiKey) {
    return res.status(500).json({ error: 'Missing ARK API Key in environment variables' });
  }

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${arkApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-6-251015',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `你是一个专业的电商图片Prompt优化专家。请帮我优化以下Prompt，使其更加专业、详细、易于AI理解。保持原有核心要求不变，增强细节描述和视觉指引。\n\n原始Prompt：\n${prompt}\n\n请输出优化后的Prompt（直接输出Prompt内容，不要有其他说明）：`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    let optimizedText = '';

    if (data.output && Array.isArray(data.output)) {
      const messageOutput = data.output.find((item: any) => item.type === 'message');
      if (messageOutput && messageOutput.content && messageOutput.content[0] && messageOutput.content[0].text) {
        optimizedText = messageOutput.content[0].text;
      }
    }

    if (optimizedText) {
      return res.status(200).json({ optimizedPrompt: optimizedText });
    } else {
      return res.status(500).json({ error: 'Invalid response format' });
    }
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    return res.status(500).json({ error: 'Failed to optimize prompt' });
  }
}
