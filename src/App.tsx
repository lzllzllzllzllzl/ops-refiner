import React, { useState, useRef, useEffect } from 'react';
import styles from '../index.module.less';

// 对于 Vite 项目，VITE_ 前缀的环境变量会自动暴露到客户端
// ImgBB Key 可以通过环境变量 VITE_IMGBB_API_KEY 或右上角输入
const getImgbbEnvKey = (): string => {
  return import.meta.env.VITE_IMGBB_API_KEY || 'bee27e6d4b59730243e9707abbd52d49';
};

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

// ============================================================
// 数据层（Data Layer）- 卫浴品类数据洞察
// ============================================================

// RFM 用户分层数据
const RFM_SEGMENTS = [
  { id: 'champion', label: '高价值用户', icon: '🏆', userCount: 12680, pct: 18, avgSpend: 4280, desc: '近30天复购3次+，客单价>3K', strategy: '推高端智能款、限量联名', color: '#E1251B' },
  { id: 'potential', label: '潜力用户', icon: '📈', userCount: 28450, pct: 40, avgSpend: 1860, desc: '近60天活跃，购买1-2次', strategy: '场景化主图提升转化、组套推荐提客单', color: '#fa8c16' },
  { id: 'at_risk', label: '流失风险', icon: '⚠️', userCount: 15320, pct: 22, avgSpend: 680, desc: '近90天未购买，历史客单价低', strategy: '促销组合拉回、低价引流款触达', color: '#8c8c8c' },
  { id: 'new_user', label: '新客用户', icon: '🆕', userCount: 14550, pct: 20, avgSpend: 520, desc: '首次访问/首次购买', strategy: '首单优惠、场景化详情页降低决策门槛', color: '#52c41a' },
];

// 品类关联分析
const CATEGORY_CORRELATIONS = [
  { from: '淋浴花洒', to: '浴室柜', rate: 32, lift: 2.4, insight: '花洒用户32%加购浴室柜，组套可提客单价35%' },
  { from: '龙头', to: '面盆', rate: 35, lift: 2.8, insight: '强关联，虚拟组套首选搭配' },
  { from: '智能马桶', to: '浴室柜', rate: 28, lift: 2.1, insight: 'Top1组合，打造"智能卫浴套装"' },
  { from: '马桶', to: '龙头', rate: 24, lift: 1.8, insight: '主图展示完整卫浴空间提升点击率22%' },
  { from: '浴室柜', to: '五金挂件', rate: 21, lift: 1.6, insight: '组套图加入挂件提升转化' },
  { from: '浴缸', to: '花洒', rate: 19, lift: 1.5, insight: '定位高端，主图突出品质感' },
];

// 价格带分析
const PRICE_BANDS = [
  { range: '0-500', label: '引流款', orders: 34200, pct: 28, conversion: 4.2, painPoint: '价格敏感型，主图突出性价比', color: '#52c41a' },
  { range: '500-1K', label: '入门款', orders: 28800, pct: 24, conversion: 3.8, painPoint: '注重基础功能，展示实用性', color: '#1890ff' },
  { range: '1K-2K', label: '中端款', orders: 25200, pct: 21, conversion: 3.1, painPoint: '品质与价格平衡，需场景化打动', color: '#722ed1' },
  { range: '2K-3K', label: '核心价格带', orders: 18000, pct: 15, conversion: 2.3, painPoint: '痛点：犹豫期长，需场景化主图+组套', color: '#E1251B' },
  { range: '3K-5K', label: '高端款', orders: 10800, pct: 9, conversion: 1.8, painPoint: '重品质感，传递高端生活方式', color: '#fa8c16' },
  { range: '5K+', label: '旗舰款', orders: 3600, pct: 3, conversion: 1.2, painPoint: '极低转化率，极致视觉+精准投放', color: '#eb2f96' },
];

const ImagePromptGenerator: React.FC = () => {
  const [promptType, setPromptType] = useState<'main_image' | 'virtual_bundle' | 'refine_product'>('main_image');
  const [dataPanelOpen, setDataPanelOpen] = useState(true);
  const [expandedInsight, setExpandedInsight] = useState<string | null>('rfm');
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

  // 精细化优化相关状态
  const [refineProductName, setRefineProductName] = useState('');
  const [refineProductType, setRefineProductType] = useState('');
  const [refineFeatures, setRefineFeatures] = useState('');
  const [refineStyle, setRefineStyle] = useState('');
  const [refineTargetAudience, setRefineTargetAudience] = useState('');
  const [refineAdditionalInfo, setRefineAdditionalInfo] = useState('');
  const [refinedTitle, setRefinedTitle] = useState('');
  const [sellingPoints, setSellingPoints] = useState('');
  const [refiningTitle, setRefiningTitle] = useState(false);
  const [refiningSellingPoints, setRefiningSellingPoints] = useState(false);

  const [runtimeImgbbKey, setRuntimeImgbbKey] = useState('');

  useEffect(() => {
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
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: generatedPrompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const optimizedText = data.optimizedPrompt;

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
      const payload = {
        model: 'doubao-seedream-4-5-251128',
        prompt,
        image: promptType === 'main_image' ? uploadedImages[0] : uploadedImages,
      };

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = '';
        try {
          const errorJson = await response.json();
          errorMessage = errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorMessage = await response.text();
        }
        console.error('❌ 生成失败:', errorMessage);
        alert(`生成失败: ${errorMessage || `HTTP ${response.status}`}`);
        throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        console.log('✨ 生成的图片URL:', data.imageUrl);
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

  // AI优化标题
  const optimizeTitle = async () => {
    if (!refineProductName) {
      alert('请输入商品名称');
      return;
    }

    setRefiningTitle(true);
    try {
      const response = await fetch('/api/refine-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'title',
          productName: refineProductName,
          productType: refineProductType,
          features: refineFeatures,
          style: refineStyle,
          targetAudience: refineTargetAudience,
          additionalInfo: refineAdditionalInfo,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.result) {
        setRefinedTitle(data.result);
      } else {
        alert('生成失败，响应格式异常');
      }
    } catch (error) {
      console.error('优化标题失败:', error);
      alert('优化标题失败: ' + (error instanceof Error ? error.message : '网络错误，请重试'));
    } finally {
      setRefiningTitle(false);
    }
  };

  // AI生成卖点
  const generateSellingPoints = async () => {
    if (!refineProductName) {
      alert('请输入商品名称');
      return;
    }

    setRefiningSellingPoints(true);
    try {
      const response = await fetch('/api/refine-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sellingPoints',
          productName: refineProductName,
          productType: refineProductType,
          features: refineFeatures,
          style: refineStyle,
          targetAudience: refineTargetAudience,
          additionalInfo: refineAdditionalInfo,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.result) {
        setSellingPoints(data.result);
      } else {
        alert('生成失败，响应格式异常');
      }
    } catch (error) {
      console.error('生成卖点失败:', error);
      alert('生成卖点失败: ' + (error instanceof Error ? error.message : '网络错误，请重试'));
    } finally {
      setRefiningSellingPoints(false);
    }
  };

  const handleModeChange = (type: 'main_image' | 'virtual_bundle' | 'refine_product') => {
    setPromptType(type);
    setGeneratedPrompt('');
    setOptimizedPrompt('');
    setGeneratedImageUrl('');
    setUploadedImages([]);
    setFormData({ productCount: 2 });
    // 重置精细化优化数据
    if (type !== 'refine_product') {
      setRefinedTitle('');
      setSellingPoints('');
    }
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
          <button
            className={`${styles.modeButton} ${promptType === 'refine_product' ? styles.activeButton : ''}`}
            onClick={() => handleModeChange('refine_product')}
          >
            ✨ 精细化优化
          </button>
        </div>
      </div>

      {/* 数据层 Data Layer - 左侧数据洞察面板 */}
      <div className={styles.dataLayerWrapper}>
        <button
          className={styles.dataPanelToggle}
          onClick={() => setDataPanelOpen(!dataPanelOpen)}
          title={dataPanelOpen ? '收起数据面板' : '展开数据面板'}
        >
          {dataPanelOpen ? '◀' : '▶'} 数据洞察
        </button>
        {dataPanelOpen && (
          <div className={styles.dataSidebar}>
            {/* 核心数据概览 */}
            <div className={styles.dataOverviewCard}>
              <div className={styles.dataOverviewTitle}>📊 卫浴品类数据概览</div>
              <div className={styles.dataOverviewGrid}>
                <div className={styles.dataOverviewItem}>
                  <span className={styles.dataOverviewValue}>7.1亿</span>
                  <span className={styles.dataOverviewLabel}>品类GMV</span>
                </div>
                <div className={styles.dataOverviewItem}>
                  <span className={styles.dataOverviewValue}>7.1万</span>
                  <span className={styles.dataOverviewLabel}>活跃用户</span>
                </div>
                <div className={styles.dataOverviewItem}>
                  <span className={styles.dataOverviewValue}>2.8%</span>
                  <span className={styles.dataOverviewLabel}>平均转化率</span>
                </div>
                <div className={styles.dataOverviewItem}>
                  <span className={styles.dataOverviewValue}>¥1,580</span>
                  <span className={styles.dataOverviewLabel}>平均客单价</span>
                </div>
              </div>
            </div>

            {/* RFM 用户分层 */}
            <div className={styles.dataCard}>
              <button
                className={styles.dataCardHeader}
                onClick={() => setExpandedInsight(expandedInsight === 'rfm' ? null : 'rfm')}
              >
                <span>👥 RFM 用户分层</span>
                <span>{expandedInsight === 'rfm' ? '▾' : '▸'}</span>
              </button>
              {expandedInsight === 'rfm' && (
                <div className={styles.dataCardBody}>
                  {RFM_SEGMENTS.map((seg) => (
                    <div key={seg.id} className={styles.rfmItem}>
                      <div className={styles.rfmItemHeader}>
                        <span className={styles.rfmLabel}>{seg.icon} {seg.label}</span>
                        <span className={styles.rfmPct} style={{ color: seg.color }}>{seg.pct}%</span>
                      </div>
                      <div className={styles.rfmBar}>
                        <div
                          className={styles.rfmBarFill}
                          style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                        />
                      </div>
                      <div className={styles.rfmMeta}>
                        <span>{seg.userCount.toLocaleString()}人</span>
                        <span>客单价 ¥{seg.avgSpend.toLocaleString()}</span>
                      </div>
                      <div className={styles.rfmInsight}>{seg.desc}</div>
                      <div className={styles.rfmStrategy}>→ {seg.strategy}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 品类关联分析 */}
            <div className={styles.dataCard}>
              <button
                className={styles.dataCardHeader}
                onClick={() => setExpandedInsight(expandedInsight === 'category' ? null : 'category')}
              >
                <span>🔗 品类关联分析</span>
                <span>{expandedInsight === 'category' ? '▾' : '▸'}</span>
              </button>
              {expandedInsight === 'category' && (
                <div className={styles.dataCardBody}>
                  {CATEGORY_CORRELATIONS.map((item, idx) => (
                    <div key={idx} className={styles.correlationItem}>
                      <div className={styles.correlationHeader}>
                        <span className={styles.correlationPair}>{item.from} + {item.to}</span>
                        <span className={styles.correlationRate} style={{ color: item.rate >= 30 ? '#E1251B' : '#fa8c16' }}>{item.rate}%</span>
                      </div>
                      <div className={styles.correlationBar}>
                        <div
                          className={styles.correlationBarFill}
                          style={{ width: `${(item.rate / 40) * 100}%`, backgroundColor: item.rate >= 30 ? '#E1251B' : '#fa8c16' }}
                        />
                      </div>
                      <div className={styles.correlationMeta}>
                        <span>关联度 {item.rate}%</span>
                        <span>Lift值 {item.lift}x</span>
                      </div>
                      <div className={styles.correlationInsight}>{item.insight}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 价格带分析 */}
            <div className={styles.dataCard}>
              <button
                className={styles.dataCardHeader}
                onClick={() => setExpandedInsight(expandedInsight === 'price' ? null : 'price')}
              >
                <span>💰 价格带分析</span>
                <span>{expandedInsight === 'price' ? '▾' : '▸'}</span>
              </button>
              {expandedInsight === 'price' && (
                <div className={styles.dataCardBody}>
                  {PRICE_BANDS.map((band, idx) => (
                    <div key={idx} className={styles.priceItem} style={{ borderLeft: `3px solid ${band.color}` }}>
                      <div className={styles.priceItemHeader}>
                        <span className={styles.priceRange}>¥{band.range}</span>
                        <span className={styles.priceLabel} style={{ color: band.color }}>{band.label}</span>
                      </div>
                      <div className={styles.priceBar}>
                        <div
                          className={styles.priceBarFill}
                          style={{ width: `${(band.pct / 30) * 100}%`, backgroundColor: band.color }}
                        />
                      </div>
                      <div className={styles.priceMeta}>
                        <span>{band.orders.toLocaleString()}单</span>
                        <span>占比{band.pct}%</span>
                        <span>转化{band.conversion}%</span>
                      </div>
                      <div className={styles.pricePainPoint}>{band.painPoint}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 策略推荐 */}
            <div className={styles.dataCard}>
              <button
                className={styles.dataCardHeader}
                onClick={() => setExpandedInsight(expandedInsight === 'strategy' ? null : 'strategy')}
              >
                <span>💡 数据驱动策略</span>
                <span>{expandedInsight === 'strategy' ? '▾' : '▸'}</span>
              </button>
              {expandedInsight === 'strategy' && (
                <div className={styles.dataCardBody}>
                  <div className={styles.strategyItem}>
                    <span className={styles.strategyTag}>主图优化</span>
                    <span className={styles.strategyText}>2K-3K价格带转化率仅2.3%，用场景化主图降低决策门槛，目标提升至3.5%</span>
                  </div>
                  <div className={styles.strategyItem}>
                    <span className={styles.strategyTag}>虚拟组套</span>
                    <span className={styles.strategyText}>花洒+浴室柜关联率32%，组套可提客单价35%，优先推卫浴套装组合</span>
                  </div>
                  <div className={styles.strategyItem}>
                    <span className={styles.strategyTag}>精细化优化</span>
                    <span className={styles.strategyText}>潜力用户(40%)用"用户语言"替代"技术语言"，场景化文案提升点击率</span>
                  </div>
                  <div className={styles.strategyItem}>
                    <span className={styles.strategyTag}>人群策略</span>
                    <span className={styles.strategyText}>高价值用户(18%)贡献42%GMV，推送高端智能款+限量联名</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* 精细化优化模式：表单在右边 */}
        {promptType === 'refine_product' ? (
          <div className={styles.fullPanel}>
            <div className={styles.refineSection}>
              <div className={styles.formCard}>
                <h3 className={styles.cardTitle}>📝 商品信息</h3>
                
                <div className={styles.formItem}>
                  <label className={styles.label}>商品名称 *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="如：智能马桶一体机"
                    value={refineProductName}
                    onChange={(e) => setRefineProductName(e.target.value)}
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>商品类型</label>
                  <select
                    className={styles.select}
                    value={refineProductType}
                    onChange={(e) => setRefineProductType(e.target.value)}
                  >
                    <option value="">请选择商品类型</option>
                    {PRODUCT_TYPES.map(item => (
                      <option key={item.value} value={item.label}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>商品特点</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="描述商品特点，如：即热式清洗、暖风烘干、座圈加热等"
                    rows={3}
                    maxLength={200}
                    value={refineFeatures}
                    onChange={(e) => setRefineFeatures(e.target.value)}
                  />
                  <span className={styles.count}>{refineFeatures.length}/200</span>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>设计风格</label>
                  <select
                    className={styles.select}
                    value={refineStyle}
                    onChange={(e) => setRefineStyle(e.target.value)}
                  >
                    <option value="">请选择设计风格</option>
                    {STYLE_OPTIONS.map(item => (
                      <option key={item.value} value={item.label}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>目标受众</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="如：年轻白领、品质生活追求者"
                    value={refineTargetAudience}
                    onChange={(e) => setRefineTargetAudience(e.target.value)}
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.label}>补充信息</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="补充其他信息，如：促销信息、特殊卖点等"
                    rows={2}
                    maxLength={100}
                    value={refineAdditionalInfo}
                    onChange={(e) => setRefineAdditionalInfo(e.target.value)}
                  />
                  <span className={styles.count}>{refineAdditionalInfo.length}/100</span>
                </div>
              </div>

              <div className={styles.resultCard}>
                <h3 className={styles.cardTitle}>✨ 精细化优化结果</h3>
                <p className={styles.hintText}>填写商品信息后，点击下方按钮生成优化内容</p>

                {/* 标题优化 */}
                <div className={styles.refineBlock}>
                  <div className={styles.refineBlockHeader}>
                    <span className={styles.refineBlockTitle}>📌 AI优化标题</span>
                    <button
                      className={`${styles.refineButton} ${refiningTitle ? styles.refining : ''}`}
                      onClick={optimizeTitle}
                      disabled={refiningTitle || !refineProductName}
                    >
                      {refiningTitle ? '🔄 生成中...' : '🚀 生成标题'}
                    </button>
                  </div>
                  {refinedTitle && (
                    <div className={styles.refineResult}>
                      <pre className={styles.refineText}>{refinedTitle}</pre>
                      <button
                        className={styles.copyButton}
                        onClick={() => copyToClipboard(refinedTitle)}
                      >
                        {copied ? '✅ 已复制' : '📋 复制'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 卖点生成 */}
                <div className={styles.refineBlock}>
                  <div className={styles.refineBlockHeader}>
                    <span className={styles.refineBlockTitle}>🎯 商品卖点</span>
                    <button
                      className={`${styles.refineButton} ${refiningSellingPoints ? styles.refining : ''}`}
                      onClick={generateSellingPoints}
                      disabled={refiningSellingPoints || !refineProductName}
                    >
                      {refiningSellingPoints ? '🔄 生成中...' : '🚀 生成卖点'}
                    </button>
                  </div>
                  {sellingPoints && (
                    <div className={styles.refineResult}>
                      <pre className={styles.refineText}>{sellingPoints}</pre>
                      <button
                        className={styles.copyButton}
                        onClick={() => copyToClipboard(sellingPoints)}
                      >
                        {copied ? '✅ 已复制' : '📋 复制'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
        {/* 仅在非精细化优化模式下显示右边面板 */}
        {promptType !== 'refine_product' && (
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
                <p>
                  <span className={styles.tagPurple}>精细化优化</span>
                  {' '}AI生成优化标题和商品卖点
                </p>
                <div className={styles.divider} />
                <p className={styles.tipsText}>💡 提示：点击"生成图片"可直接生成设计图，无需复制到其他平台</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePromptGenerator;