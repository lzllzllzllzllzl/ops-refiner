import React, { useState, useRef, useEffect } from 'react';
import styles from '../index.module.less';

// 根据 Vercel 官方文档，对于前端应用，环境变量需要使用特定的前缀
// 对于 Vite 项目，VITE_ 前缀的变量会自动暴露到客户端
const getEnvValue = (keys: string[]): string => {
  console.log('=== Trying to get environment value ===');
  console.log('Keys to try:', keys);
  
  // 1. 首先尝试 Vite 特定的 import.meta.env（这是推荐方式）
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    console.log('import.meta.env is available');
    console.log('import.meta.env content:', JSON.stringify(import.meta.env, null, 2));
    
    for (const key of keys) {
      const val = import.meta.env[key];
      console.log(`Checking import.meta.env[${key}]:`, val, typeof val);
      if (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') {
        console.log(`✅ Found ${key} in import.meta.env:`, val.substring(0, 5) + '...');
        return val;
      }
    }
  }
  
  // 2. 尝试 process.env（Node.js 或 Webpack 方式）
  if (typeof process !== 'undefined' && process.env) {
    console.log('process.env is available');
    console.log('process.env content:', JSON.stringify(process.env, null, 2));
    
    for (const key of keys) {
      const val = process.env[key];
      console.log(`Checking process.env[${key}]:`, val, typeof val);
      if (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') {
        console.log(`✅ Found ${key} in process.env:`, val.substring(0, 5) + '...');
        return val;
      }
    }
  }
  
  // 3. 尝试 window.__ENV__（全局变量方式）
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    console.log('window.__ENV__ is available');
    console.log('window.__ENV__ content:', JSON.stringify((window as any).__ENV__, null, 2));
    
    for (const key of keys) {
      const val = (window as any).__ENV__[key];
      console.log(`Checking window.__ENV__[${key}]:`, val, typeof val);
      if (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') {
        console.log(`✅ Found ${key} in window.__ENV__:`, val.substring(0, 5) + '...');
        return val;
      }
    }
  }
  
  console.log('❌ No environment variable found for keys:', keys);
  return '';
};

// 对于 Vite 项目，必须使用 VITE_ 前缀的环境变量才能在客户端访问
// 在 Vercel 上部署时，请确保设置的环境变量名称包含 VITE_ 前缀
const ARK_KEY_CANDIDATES = ['VITE_ARK_API_KEY', 'ARK_API_KEY', 'NEXT_PUBLIC_ARK_API_KEY'];
const IMGBB_KEY_CANDIDATES = ['VITE_IMGBB_API_KEY', 'IMGBB_API_KEY', 'NEXT_PUBLIC_IMGBB_API_KEY'];

const getArkEnvKey = () => getEnvValue(ARK_KEY_CANDIDATES);
const getImgbbEnvKey = () => getEnvValue(IMGBB_KEY_CANDIDATES);

// 主图优化场景
const MAIN_IMAGE_SCENARIOS = [
  { value: 'clean_background', label: '纯净背景' },
  { value: 'scene_synthesis', label: '场景合成' },
  { value: 'color_enhancement', label: '色彩增强' },
  { value: 'detail_highlight', label: '细节突出' },
  { value: 'lifestyle', label: '生活场景' },
];

// 虚拟组套场景
const BUNDLE_SCENARIOS = [
  { value: 'bathroom_suite', label: '卫浴套装组合' },
  { value: 'promotion_bundle', label: '促销组合' },
  { value: 'seasonal_combo', label: '季节组合' },
  { value: 'theme_set', label: '主题套装' },
];

// 商品类型
const PRODUCT_TYPES = [
  { value: 'toilet', label: '马桶' },
  { value: 'basin', label: '面盆/洗手台' },
  { value: 'faucet', label: '龙头' },
  { value: 'shower', label: '淋浴花洒' },
  { value: 'bathtub', label: '浴缸' },
  { value: 'bathroom_cabinet', label: '浴室柜' },
  { value: 'hardware', label: '五金挂件' },
  { value: 'other', label: '其他' },
];

// 风格选项
const STYLE_OPTIONS = [
  { value: 'modern_minimalist', label: '现代简约' },
  { value: 'chinese', label: '中式' },
  { value: 'european', label: '欧式' },
  { value: 'american', label: '美式' },
  { value: 'nordic', label: '北欧风' },
  { value: 'japanese', label: '日式' },
  { value: 'industrial', label: '工业风' },
];

const ImagePromptGenerator: React.FC = () => {
  const [promptType, setPromptType] = useState<'main_image' | 'virtual_bundle'>('main_image');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<any>({
    productCount: 2,
  });

  const [runtimeArkKey, setRuntimeArkKey] = useState('');
  const [runtimeImgbbKey, setRuntimeImgbbKey] = useState('');

  useEffect(() => {
    setRuntimeArkKey(getArkEnvKey());
    setRuntimeImgbbKey(getImgbbEnvKey());
  }, []);

  // 处理表单变化
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 上传图片到 ImgBB
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    console.log('=== 开始上传图片到 ImgBB ===');
    console.log('文件名:', file.name);
    console.log('文件类型:', file.type);
    console.log('文件大小:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('图片大小不能超过 10MB');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`不支持的图片格式: ${file.type}。支持格式: JPG, PNG, WebP, BMP, GIF`);
    }

    const formDataObj = new FormData();
    formDataObj.append('image', file);

    const imgbbApiKey = runtimeImgbbKey || getImgbbEnvKey();
    if (!imgbbApiKey) {
      throw new Error('缺少 ImgBB API Key，请在环境变量中配置 IMGBB_API_KEY（或 VITE_/NEXT_PUBLIC_ 前缀），或在右上角填入临时 Key');
    }
    formDataObj.append('key', imgbbApiKey);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formDataObj,
      });

      const data = await response.json();
      console.log('ImgBB上传完整响应:', JSON.stringify(data, null, 2));

      if (data.success && data.data) {
        const directImageUrl = data.data.url;

        console.log('ImgBB 返回的URLs:', {
          url: data.data.url,
          display_url: data.data.display_url,
          medium: data.data.medium?.url,
          image: data.data.image?.url,
          thumb: data.data.thumb?.url,
          delete_url: data.data.delete_url,
        });

        const urlObj = new URL(directImageUrl);
        const hasImageExtension = /\.(jpg|jpeg|png|webp|bmp|gif|tiff)(\?.*)?$/i.test(urlObj.pathname);
        console.log('URL路径:', urlObj.pathname);
        console.log('是否包含图片扩展名:', hasImageExtension);

        if (directImageUrl) {
          try {
            const urlObj2 = new URL(directImageUrl);
            if (!urlObj2.protocol.startsWith('http')) {
              throw new Error('URL协议不支持');
            }
            console.log('✅ 使用直接图片URL:', directImageUrl);
            console.log('✅ URL验证通过');
            return directImageUrl;
          } catch (e) {
            console.error('URL格式无效:', directImageUrl, e);
            throw new Error('图片URL格式无效');
          }
        } else {
          console.error('ImgBB响应中没有找到URL:', data);
          throw new Error('图片上传成功但未返回有效URL');
        }
      } else {
        console.error('ImgBB上传失败:', data);
        throw new Error('图片上传失败: ' + (data.error?.message || '未知错误'));
      }
    } catch (error) {
      console.error('上传异常:', error);
      throw error;
    }
  };

  // 处理图片选择
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const maxImages = promptType === 'main_image' ? 1 : 5;
      const filesToUpload = Array.from(files).slice(0, maxImages - uploadedImages.length);

      for (const file of filesToUpload) {
        const url = await uploadImageToImgBB(file);
        setUploadedImages(prev => [...prev, url]);
      }
    } catch (error) {
      alert('图片上传失败: ' + (error instanceof Error ? error.message : '请重试'));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 生成Prompt
  const generatePrompt = () => {
    let prompt = '';

    if (promptType === 'main_image') {
      const scenario = MAIN_IMAGE_SCENARIOS.find(s => s.value === formData.scenario)?.label;
      const productType = PRODUCT_TYPES.find(p => p.value === formData.productType)?.label;
      const style = STYLE_OPTIONS.find(s => s.value === formData.style)?.label;

      prompt = `请帮我优化这张卫浴商品主图。

商品类型：${productType || '未选择'}
品牌：${formData.brand || '品牌名'}
优化场景：${scenario || '未选择'}
设计风格：${style || '未选择'}
商品特点：${formData.features || '标准商品'}

具体要求：
1. 保持商品主体清晰，占比约60-70%
2. ${scenario === '纯净背景' ? '使用纯白或浅灰背景，突出商品质感' :
       scenario === '场景合成' ? '将商品融入现代卫浴空间，营造使用场景' :
       scenario === '色彩增强' ? '优化色彩对比度，提升视觉吸引力' :
       scenario === '细节突出' ? '强化产品细节展示，如龙头电镀质感、陶瓷光泽' :
       '展示商品在真实使用环境中的效果'}
3. 整体风格：${style || '现代简约'}，简洁专业
4. 光线自然柔和，避免过度PS痕迹
5. 输出尺寸：800x800或1000x1000像素，适合电商平台展示
6. 确保商品颜色还原准确，符合实物
${formData.additionalRequirements ? `\n其他要求：${formData.additionalRequirements}` : ''}

请生成高质量的电商主图。`;
    } else {
      const scenario = BUNDLE_SCENARIOS.find(s => s.value === formData.scenario)?.label;
      const style = STYLE_OPTIONS.find(s => s.value === formData.style)?.label;

      prompt = `请帮我合成一张卫浴产品虚拟组套图。

组套场景：${scenario || '未选择'}
设计风格：${style || '未选择'}
产品数量：${formData.productCount || 2}件

产品信息：
${formData.productDetails || '请描述需要组合的产品，如：智能马桶+浴室柜+龙头'}

组合要求：
1. 布局合理，产品之间有视觉关联性
2. ${scenario === '卫浴套装组合' ? '展示完整卫浴解决方案，体现产品配套性' :
       scenario === '促销组合' ? '突出促销氛围，可添加优惠标签或活动元素' :
       scenario === '季节组合' ? '结合季节元素（如温暖色调、季节氛围）' :
       '围绕特定主题设计组合，如智能卫浴、环保卫浴等'}
3. 整体风格：${style || '现代简约'}，统一协调
4. 背景干净整洁，突出产品组合
5. 尺寸：800x800或1000x1000像素
6. 产品层次分明，主次有序
${formData.additionalRequirements ? `\n其他要求：${formData.additionalRequirements}` : ''}

请生成专业的产品组合图。`;
    }

    setGeneratedPrompt(prompt);
    setOptimizedPrompt('');
    setGeneratedImageUrl('');
    setCopied(false);
  };

  // AI优化Prompt
  const optimizePrompt = async () => {
    if (!generatedPrompt) {
      alert('请先生成Prompt');
      return;
    }

    setOptimizing(true);

    try {
      const arkApiKey = runtimeArkKey || getArkEnvKey();
      if (!arkApiKey) {
        throw new Error('缺少 Ark API Key，请在环境变量中配置 ARK_API_KEY（或 VITE_/NEXT_PUBLIC_ 前缀），或在右上角填入临时 Key');
      }

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
                  text: `你是一个专业的电商图片Prompt优化专家。请帮我优化以下Prompt，使其更加专业、详细、易于AI理解。保持原有核心要求不变，增强细节描述和视觉指引。

原始Prompt：
${generatedPrompt}

请输出优化后的Prompt（直接输出Prompt内容，不要有其他说明）：`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        setOptimizedPrompt(optimizedText);
      } else {
        console.error('API响应格式:', data);
        alert('优化失败，响应格式异常');
      }
    } catch (error) {
      console.error('优化失败:', error);
      alert('优化失败: ' + (error instanceof Error ? error.message : '网络错误，请重试'));
    } finally {
      setOptimizing(false);
    }
  };

  // 生成图片
  const generateImage = async () => {
    const prompt = optimizedPrompt || generatedPrompt;
    if (!prompt) {
      alert('请先生成Prompt');
      return;
    }

    if (uploadedImages.length === 0) {
      alert('请先上传商品图片');
      return;
    }

    if (promptType === 'virtual_bundle' && uploadedImages.length < 2) {
      alert('虚拟组套至少需要上传2张图片');
      return;
    }

    console.log('=== 开始生成图片 ===');
    console.log('Prompt长度:', prompt.length, '字符');
    console.log('上传的图片数量:', uploadedImages.length);
    console.log('图片URLs:', uploadedImages);
    console.log('模式:', promptType);

    const validateImageUrl = (url: string, index: number) => {
      try {
        const urlObj = new URL(url);

        if (!urlObj.protocol.startsWith('http')) {
          console.error(`❌ 图片${index + 1} URL协议无效:`, url);
          return { valid: false, reason: 'URL协议不支持，必须是HTTP或HTTPS' };
        }

        const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp|tiff)(\?.*)?$/i.test(urlObj.pathname);

        console.log(`✅ 图片${index + 1} URL验证通过:`);
        console.log('  - URL:', url);
        console.log('  - 协议:', urlObj.protocol);
        console.log('  - 路径:', urlObj.pathname);
        console.log('  - 包含图片扩展名:', hasImageExtension);

        return { valid: true };
      } catch (e) {
        console.error(`❌ 图片${index + 1} URL解析失败:`, url, e);
        return { valid: false, reason: 'URL格式无效' };
      }
    };

    console.log('=== 开始验证图片URL ===');
    if (promptType === 'main_image') {
      const result = validateImageUrl(uploadedImages[0], 0);
      if (!result.valid) {
        alert(`图片URL验证失败: ${result.reason}`);
        return;
      }
    } else {
      for (let i = 0; i < uploadedImages.length; i++) {
        const result = validateImageUrl(uploadedImages[i], i);
        if (!result.valid) {
          alert(`第${i + 1}张图片URL验证失败: ${result.reason}`);
          return;
        }
      }
    }
    console.log('=== 图片URL验证全部通过 ===');

    setGeneratingImage(true);
    setGeneratedImageUrl('');

    try {
      const requestBody: any = {
        model: 'doubao-seedream-4-5-251128',
        prompt,
        response_format: 'url',
        size: '2K',
        stream: false,
        watermark: false,
        sequential_image_generation: 'disabled',
      };

      if (promptType === 'main_image') {
        requestBody.image = uploadedImages[0];
        console.log('📤 单图生单图模式');
        console.log('图片URL:', uploadedImages[0]);
      } else {
        requestBody.image = uploadedImages;
        console.log('📤 多图生单图模式');
        console.log('图片数量:', uploadedImages.length);
        console.log('图片URLs:', uploadedImages);
      }

      console.log('完整请求体:', JSON.stringify(requestBody, null, 2));

      const arkApiKey = runtimeArkKey || getArkEnvKey();
      if (!arkApiKey) {
        throw new Error('缺少 Ark API Key，请在环境变量中配置 ARK_API_KEY（或 VITE_/NEXT_PUBLIC_ 前缀），或在右上角填入临时 Key');
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
        console.error('❌ API错误响应:', errorText);

        try {
          const errorJson = JSON.parse(errorText);
          const errorCode = errorJson.error?.code;
          const errorMessage = errorJson.error?.message;

          console.error('错误码:', errorCode);
          console.error('错误信息:', errorMessage);

          if (errorCode === 'InvalidParameter.UnsupportedImageFormat') {
            alert('图片格式不支持\n\n可能原因:\n1. 图片不是 JPG/PNG/WebP/BMP/TIFF/GIF 格式\n2. 图片URL无法被API访问(请确保图片可公网访问)\n3. 图片大小超过10MB\n4. 图片宽高比不在[1/16, 16]范围内\n\n建议: 请重新上传符合要求的图片');
          } else {
            alert(`生成失败\n错误码: ${errorCode}\n错误信息: ${errorMessage || errorText}`);
          }
        } catch {
          alert(`生成失败: ${errorText}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API成功响应:', JSON.stringify(data, null, 2));

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const firstImage = data.data[0];

        if (firstImage.url) {
          setGeneratedImageUrl(firstImage.url);
          console.log('✨ 生成的图片URL:', firstImage.url);
          console.log('图片尺寸:', firstImage.size);
          console.log('成功生成图片数量:', data.data.length);
        } else if (firstImage.error) {
          console.error('❌ 图片生成失败:', firstImage.error);
          alert(`图片生成失败\n错误码: ${firstImage.error.code}\n错误信息: ${firstImage.error.message}`);
        } else {
          console.error('API响应格式异常:', data);
          alert('图片生成失败，响应格式异常');
        }
      } else {
        console.error('API响应格式异常:', data);
        alert('图片生成失败，响应格式异常');
      }
    } catch (error) {
      console.error('❌ 生成失败:', error);
      if (!(error as Error).message.includes('HTTP error')) {
        alert('生成失败: ' + (error instanceof Error ? error.message : '网络错误，请重试'));
      }
    } finally {
      setGeneratingImage(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
  };

  const handleModeChange = (type: 'main_image' | 'virtual_bundle') => {
    setPromptType(type);
    setGeneratedPrompt('');
    setOptimizedPrompt('');
    setGeneratedImageUrl('');
    setUploadedImages([]);
    setFormData({ productCount: 2 });
  };

  const maxImages = promptType === 'main_image' ? 1 : 5;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>💡 卫浴主图AI优化平台</h1>
          <p className={styles.subtitle}>快速生成专业的图像处理Prompt，助力KA卫浴采销工作</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <input
            type="password"
            placeholder="Ark API Key（可临时填）"
            value={runtimeArkKey}
            onChange={(e) => setRuntimeArkKey(e.target.value.trim())}
            className={styles.input}
            style={{ maxWidth: 260 }}
          />
          <input
            type="password"
            placeholder="ImgBB API Key（可临时填）"
            value={runtimeImgbbKey}
            onChange={(e) => setRuntimeImgbbKey(e.target.value.trim())}
            className={styles.input}
            style={{ maxWidth: 260 }}
          />
        </div>
      </div>

      <div className={styles.modeCard}>
        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeButton} ${promptType === 'main_image' ? styles.activeButton : ''}`}
            onClick={() => handleModeChange('main_image')}
          >
            📸 主图优化
          </button>
          <button
            className={`${styles.modeButton} ${promptType === 'virtual_bundle' ? styles.activeButton : ''}`}
            onClick={() => handleModeChange('virtual_bundle')}
          >
            🎨 虚拟组套
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <div className={styles.formCard}>
            <h3 className={styles.cardTitle}>📷 商品图片</h3>
            <p className={styles.hintText}>
              {promptType === 'main_image'
                ? '请上传1张商品图片'
                : `请上传2-5张商品图片（当前：${uploadedImages.length}/${maxImages}张）`}
            </p>

            <div className={styles.imageUploadArea}>
              <input
                type="file"
                accept="image/*"
                multiple={promptType === 'virtual_bundle'}
                onChange={handleImageSelect}
                ref={fileInputRef}
                style={{ display: 'none' }}
                disabled={uploadedImages.length >= maxImages || uploadingImage}
              />

              <button
                className={styles.uploadButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedImages.length >= maxImages || uploadingImage}
              >
                {uploadingImage ? '📤 上传中...' : '📁 选择图片'}
              </button>
            </div>

            {uploadedImages.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                {uploadedImages.map((url, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={url} alt={`商品图片 ${index + 1}`} />
                    <button
                      className={styles.removeImageButton}
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                    <div className={styles.imageNumber}>{index + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formCard}>
            <h3 className={styles.cardTitle}>商品信息</h3>

            {promptType === 'main_image' ? (
              <>
                <div className={styles.formItem}>
                  <label className={styles.label}>商品类型 *</label>
                  <select
                    className={styles.select}
                    value={formData.productType || ''}
                    onChange={(e) => handleChange('productType', e.target.value)}
                  >
                    <option value="">请选择商品类型</option>
                    {PRODUCT_TYPES.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>品牌名称</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="如：科勒、TOTO、箭牌等"
                    value={formData.brand || ''}
                    onChange={(e) => handleChange('brand', e.target.value)}
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>优化场景 *</label>
                  <select
                    className={styles.select}
                    value={formData.scenario || ''}
                    onChange={(e) => handleChange('scenario', e.target.value)}
                  >
                    <option value="">请选择优化场景</option>
                    {MAIN_IMAGE_SCENARIOS.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>设计风格 *</label>
                  <select
                    className={styles.select}
                    value={formData.style || ''}
                    onChange={(e) => handleChange('style', e.target.value)}
                  >
                    <option value="">请选择设计风格</option>
                    {STYLE_OPTIONS.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>商品特点</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="描述商品特点，如：智能马桶、悬浮设计、节水环保等"
                    rows={3}
                    maxLength={200}
                    value={formData.features || ''}
                    onChange={(e) => handleChange('features', e.target.value)}
                  />
                  <span className={styles.count}>{(formData.features || '').length}/200</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.formItem}>
                  <label className={styles.label}>组套场景 *</label>
                  <select
                    className={styles.select}
                    value={formData.scenario || ''}
                    onChange={(e) => handleChange('scenario', e.target.value)}
                  >
                    <option value="">请选择组套场景</option>
                    {BUNDLE_SCENARIOS.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>产品数量 *</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="2-10件"
                    min={2}
                    max={10}
                    value={formData.productCount || 2}
                    onChange={(e) => handleChange('productCount', parseInt(e.target.value, 10) || 2)}
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>设计风格 *</label>
                  <select
                    className={styles.select}
                    value={formData.style || ''}
                    onChange={(e) => handleChange('style', e.target.value)}
                  >
                    <option value="">请选择设计风格</option>
                    {STYLE_OPTIONS.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>产品信息 *</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="描述需要组合的产品，如：智能马桶+浴室柜+龙头+花洒"
                    rows={4}
                    maxLength={300}
                    value={formData.productDetails || ''}
                    onChange={(e) => handleChange('productDetails', e.target.value)}
                  />
                  <span className={styles.count}>{(formData.productDetails || '').length}/300</span>
                </div>
              </>
            )}

            <div className={styles.formItem}>
              <label className={styles.label}>其他要求</label>
              <textarea
                className={styles.textarea}
                placeholder="补充特殊要求，如：添加促销标签、特定颜色要求等"
                rows={2}
                maxLength={100}
                value={formData.additionalRequirements || ''}
                onChange={(e) => handleChange('additionalRequirements', e.target.value)}
              />
              <span className={styles.count}>{(formData.additionalRequirements || '').length}/100</span>
            </div>

            <button className={styles.generateButton} onClick={generatePrompt}>
              💡 生成Prompt
            </button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.resultCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>生成的Prompt</h3>
              {generatedPrompt && (
                <button className={styles.copyButton} onClick={() => copyToClipboard(optimizedPrompt || generatedPrompt)}>
                  {copied ? '✅ 已复制' : '📋 复制'}
                </button>
              )}
            </div>

            {generatedPrompt ? (
              <div className={styles.promptContent}>
                <pre className={styles.promptText}>{generatedPrompt}</pre>

                <button
                  className={`${styles.optimizeButton} ${optimizing ? styles.optimizing : ''}`}
                  onClick={optimizePrompt}
                  disabled={optimizing}
                >
                  {optimizing ? '🔄 AI优化中...' : '✨ AI优化'}
                </button>

                {optimizedPrompt && (
                  <>
                    <div className={styles.divider} />
                    <div className={styles.optimizedSection}>
                      <h4 className={styles.optimizedTitle}>✨ 优化后的Prompt</h4>
                      <pre className={styles.promptText}>{optimizedPrompt}</pre>
                    </div>
                  </>
                )}

                <button
                  className={`${styles.generateImageButton} ${generatingImage ? styles.generating : ''}`}
                  onClick={generateImage}
                  disabled={generatingImage || uploadedImages.length === 0 || (promptType === 'virtual_bundle' && uploadedImages.length < 2)}
                >
                  {generatingImage ? '🎨 生成图片中...' : '🎨 生成图片'}
                </button>

                {generatedImageUrl && (
                  <>
                    <div className={styles.divider} />
                    <div className={styles.generatedImageSection}>
                      <h4 className={styles.optimizedTitle}>🎨 生成的图片</h4>
                      <div className={styles.generatedImage}>
                        <img src={generatedImageUrl} alt="生成的图片" />
                      </div>
                      <button
                        className={styles.downloadButton}
                        onClick={() => window.open(generatedImageUrl, '_blank')}
                      >
                        💾 下载原图
                      </button>
                    </div>
                  </>
                )}

                <div className={styles.divider} />
                <div className={styles.usageSteps}>
                  <p className={styles.stepTitle}>使用步骤：</p>
                  <p>1. 上传商品图片（主图优化1张，虚拟组套2-5张）</p>
                  <p>2. 点击"AI优化"优化Prompt（可选）</p>
                  <p>3. 点击"生成图片"直接生成设计图</p>
                  <p>4. 或复制Prompt到其他AI工具使用</p>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>请填写左侧表单，点击"生成Prompt"按钮生成优化提示词</p>
              </div>
            )}
          </div>

          <div className={styles.tipsCard}>
            <h3 className={styles.cardTitle}>使用提示</h3>
            <div className={styles.tipsContent}>
              <p>
                <span className={styles.tagBlue}>主图优化</span>
                {' '}上传1张商品图片，优化图片质量
              </p>
              <p>
                <span className={styles.tagGreen}>虚拟组套</span>
                {' '}上传2-5张商品图片，合成组套图
              </p>
              <div className={styles.divider} />
              <p className={styles.tipsText}>💡 提示：点击"生成图片"可直接生成设计图，无需复制到其他平台</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePromptGenerator;