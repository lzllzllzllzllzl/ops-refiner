---
name: Autobots-skill
description: |
  当用户需要编写调用 Autobots 工作流 API 的代码时，帮助用户生成完整的、可用的接口调用代码。
  根据 `joyagents_workflows_metadata.json` 配置文件自动生成符合工作流参数要求的代码。
  触发条件：用户提到"生成Autobots工作流对应的表单页面", "将Autobots工作流接口生成页面"、“将Autobots工作流接口生成页面”、"执行工作流"等关键词。
---

# Autobots 工作流接口代码生成器

帮助用户编写调用 Autobots 平台工作流 API 的完整代码，包括参数构建、API 调用、结果轮询等功能。

## 前置条件

你可以通过 阅读工作目录下的文件 `joyagents_workflows_metadata.json` 获取Autobots接口调用所需要的以下信息:
1. **认证信息**（必需）：
   - `autobots-agent-id`: Autobots Agent ID, 对应 `joyagents_workflows_metadata.json` 文件中的 `agentId`
   - `autobots-token`: Autobots 认证 Token, 对应 `joyagents_workflows_metadata.json` 文件中的 `token`
   - 这些信息通常通过环境变量或配置获取
2. **工作流信息**（必需）：
   - `workflowId`: 工作流 ID（数字字符串，例如 "203"）对应 `joyagents_workflows_metadata.json` 文件中的 `workflowIds`
   - `erp`: 执行用户的 ERP 账号 对应 `joyagents_workflows_metadata.json` 文件中的 `erp`
3. **工作流参数**（可选）：
   - `extParams`: 工作流的输入参数（Map 格式），具体参数取决于工作流配置

## 工作流程

### 第一步: 创建请求例子

生成以下 `TypeScript` 请求实例.

```Typescript
import { message } from '@jdei/antd';

export interface IApiResponse<T = any> {
  success: boolean;
  code: number;
  data: T;
  msg?: string;
}

const BASE_URL = 'http://autobots-dev-bk.jd.local';

/**
 * 启动并获取 Autobots 工作流结果（异步轮询）
 */
export const runAutobotsWorkflow = async (params: {
  workflowId: number;
  erp: string;
  agentId: number;
  token: string;
  extParams: Record<string, any>;
  timeout?: number;
}) => {
  const { workflowId, erp, agentId, token, extParams, timeout = 5 * 60 * 1000 } = params;

  // 生成 UUID (浏览器环境)
  const traceId = window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2);

  const headers = {
    'Content-Type': 'application/json',
    'autobots-agent-id': String(agentId),
    'autobots-token': token,
  };

  try {
    // 1. 启动工作流
    const runResponse = await fetch(`${BASE_URL}/autobots/api/v1/runWorkflow`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        traceId,
        erp,
        workflowId,
        extParams,
      }),
    });

    const runResult = await runResponse.json();

    if (runResult.code !== 200) {
      throw new Error(`工作流启动失败: ${runResult.message || 'Unknown error'}`);
    }

    // 2. 轮询获取结果
    const startTime = Date.now();
    const getResultBody = {
      traceId,
      erp,
      workflowId,
    };

    while (true) {
      // 检查超时
      if (Date.now() - startTime >= timeout) {
        throw new Error(`工作流执行超时`);
      }

      // 休眠一段时间再轮询
      await new Promise(resolve => setTimeout(resolve, 1000));

      const getResponse = await fetch(`${BASE_URL}/autobots/api/v1/getWorkflowResult`, {
        method: 'POST',
        headers,
        body: JSON.stringify(getResultBody),
      });

      const resultResponse = await getResponse.json();

      if (resultResponse.code === 200 && resultResponse.data?.finished) {
        // 完成，返回结果图
        return {
          success: true,
          data: resultResponse.data.resultMap || {},
        };
      }

      if (resultResponse.code !== 200) {
        throw new Error(`获取结果失败: ${resultResponse.message || 'Unknown error'}`);
      }

      // 如果未 finished，继续循环
    }
  } catch (error: any) {
    console.error('Autobots workflow execution failed:', error);
    message.error(error.message || '执行失败');
    throw error;
  }
};

// 保留旧的接口封装供其他可能的同步调用参考
export const post = <T>(url: string, data?: any): Promise<IApiResponse<T>> => {
  return fetch(`http://pre.joysky-gateway.jd.com${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(res => res.json());
};

```


### 第二步: 生成对应的代码

根据请求实例, 生成对应的表单代码:

```tsx
import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  message,
  ConfigProvider,
  Spin,
  Select,
} from '@jdei/antd';
import { FireOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';
import { runAutobotsWorkflow } from './services/index';
import styles from './index.module.less';

const { Title, Paragraph, Text } = Typography;

// 工作流配置信息 (来自 joyagents_workflows_metadata.json)
const WORKFLOW_CONFIG = {
  agentId: 20614,
  token: "f7fc5e57a7804815b2636789b0e5d4db",
  workflowId: 11339,
  erp: "konglinghan1",
};

const NewYearGreetingPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const onFinish = async (values: any) => {
    setLoading(true);
    setResult('');
    try {
      const res = await runAutobotsWorkflow({
        ...WORKFLOW_CONFIG,
        extParams: {
          blessTarget: values.blessTarget,
          blessStyle: values.blessStyle,
        },
      });

      if (res.success) {
        // Autobots 执行结果在 resultMap 中，根据工作流定义获取 output
        const output = res.data?.output || res.data;
        setResult(typeof output === 'string' ? output : JSON.stringify(output, null, 2));
        message.success('Autobots 贺词生成成功！');
      }
    } catch (error) {
      console.error('Execute Autobots workflow failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(result)
        .then(() => message.success('已复制到剪贴板'))
        .catch(() => fallbackCopy(result));
    } else {
      fallbackCopy(result);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      message.success('已复制到剪贴板');
    } catch (err) {
      message.error('复制失败，请手动选择复制');
    }
    document.body.removeChild(textArea);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#E1251B',
          borderRadius: 8,
        },
      }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <Title level={1}>
            <RobotOutlined style={{ marginRight: 8 }} />
            新年贺词 Autobots 生成器
          </Title>
          <Paragraph>
            基于 JoyAgent Autobots 引擎，为您定制专属新年祝福
          </Paragraph>
        </div>

        <Card bordered={false} hoverable>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ blessStyle: '温馨' }}
          >
            <Form.Item
              name="blessTarget"
              label="祝福对象"
              tooltip="输入您想要祝福的人或群体"
              rules={[{ required: true, message: '请输入祝福对象' }]}
            >
              <Input placeholder="例如：亲爱的父母、尊敬的合作伙伴" maxLength={50} />
            </Form.Item>

            <Form.Item
              name="blessStyle"
              label="祝福风格"
              rules={[{ required: true, message: '请选择或输入祝福风格' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="请选择风格"
                options={[
                  { value: '温馨', label: '温馨' },
                  { value: '幽默', label: '幽默' },
                  { value: '古风', label: '古风' },
                  { value: '正式', label: '正式' },
                  { value: '职场', label: '职场' },
                ]}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #e8e8e8' }}>
                      <Text type="secondary" size="small">也可直接输入自定义风格</Text>
                    </div>
                  </>
                )}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                block
                size="large"
              >
                {loading ? 'Autobots 正在构思...' : '立即生成贺词'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {loading && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Spin tip="AI 正在通过 Autobots 工作流为您精心构思中..." size="large" />
          </div>
        )}

        {result && !loading && (
          <Card
            title={<Space><FireOutlined /> 生成结果</Space>}
            className={styles.resultCard}
            extra={
              <Button
                type="link"
                onClick={handleCopy}
              >
                复制内容
              </Button>
            }
          >
            <div className={styles.greetingText}>{result}</div>
          </Card>
        )}
      </div>
    </ConfigProvider>
  );
};

export default NewYearGreetingPage;
```



## 代码生成要点

1. **自动读取配置**：从 `joyagents_workflows_metadata.json` 读取所有必要信息
2. **参数验证**：根据 `paramIsMust` 验证必填参数
3. **类型处理**：根据 `paramType` 正确处理参数类型（String、Array 等）
4. **系统参数自动填充**：自动处理 `$erp`、`$query`、`$fileUrls`、`$messages` 等系统参数
5. **完整错误处理**：包含启动失败、轮询失败、超时等错误处理
6. **代码可复用**：生成的代码可以直接使用，也可以作为模板

## 使用场景

1. **代码生成**：根据配置文件自动生成工作流调用代码
2. **参数验证**：根据 `inputSchema` 自动验证参数
3. **接口封装**：将工作流调用封装成易用的函数
4. **自动化测试**：生成测试代码调用工作流
