import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, productName, productType, features, style, targetAudience, additionalInfo } = req.body;
  
  if (!type || !productName) {
    return res.status(400).json({ error: 'Missing required fields: type, productName' });
  }

  const arkApiKey = process.env.ARK_API_KEY;
  if (!arkApiKey) {
    return res.status(500).json({ error: 'Missing ARK API Key in environment variables' });
  }

  // 根据类型构建不同的prompt
  let systemPrompt = '';
  
  if (type === 'title') {
    systemPrompt = `你是一个专业的电商文案专家，擅长撰写吸引人的商品标题。请根据以下信息生成优化后的商品标题。

要求：
1. 标题长度控制在20-30字之间
2. 突出商品卖点和使用场景
3. 符合电商平台标题规范
4. 包含品牌名和核心关键词
5. 具有吸引力和点击欲望

请直接输出标题，不要有其他说明。`;
  } else if (type === 'sellingPoints') {
    systemPrompt = `你是一个专业的电商文案专家，擅长撰写商品卖点文案。请根据以下信息生成商品卖点。

要求：
1. 列出3-5个核心卖点
2. 每个卖点用简洁有力的语言描述
3. 突出商品优势和差异化特点
4. 符合目标受众的关注点
5. 便于用户快速了解商品价值

请按以下格式输出（不要有其他说明）：
卖点1：xxx
卖点2：xxx
卖点3：xxx
卖点4：xxx
卖点5：xxx`;
  } else {
    return res.status(400).json({ error: 'Invalid type. Must be "title" or "sellingPoints"' });
  }

  const userPrompt = `商品信息：
商品名称：${productName}
商品类型：${productType || '卫浴产品'}
商品特点：${features || '标准商品'}
设计风格：${style || '现代简约'}
目标受众：${targetAudience || '普通消费者'}
补充信息：${additionalInfo || '无'}`;

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
                text: `${systemPrompt}\n\n${userPrompt}`,
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
    let resultText = '';

    if (data.output && Array.isArray(data.output)) {
      const messageOutput = data.output.find((item: any) => item.type === 'message');
      if (messageOutput && messageOutput.content && messageOutput.content[0] && messageOutput.content[0].text) {
        resultText = messageOutput.content[0].text;
      }
    }

    if (resultText) {
      return res.status(200).json({ result: resultText });
    } else {
      return res.status(500).json({ error: 'Invalid response format' });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}