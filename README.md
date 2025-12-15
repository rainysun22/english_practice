# 英音口语对话应用 🎤

与多种角色练习英音英语，实时纠正和智能打分。

## ✨ 功能特性

- 🎭 **甜美角色**：3种不同性格的甜美英音角色供选择
- 💬 **自然对话**：基于AI的流畅对话体验
- ✅ **实时纠正**：自动检测语法和表达错误，提供改进建议
- 📊 **智能打分**：评估发音、流利度、准确性和总分
- 🎤 **语音输入**：支持浏览器语音识别
- 🔊 **语音播放**：使用浏览器内置TTS播放AI回复
- 💰 **成本优化**：使用浏览器内置TTS，完全免费

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

**方式1：使用智谱AI（推荐，对话效果好）**
```env
AI_PROVIDER=zhipu
ZHIPU_API_KEY=your_zhipu_api_key
```

**方式2：使用通义千问**
```env
AI_PROVIDER=qwen
DASHSCOPE_API_KEY=your_dashscope_api_key
```

**方式3：使用OpenAI（备用）**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
```

### 获取API密钥

- **智谱AI**: 访问 [https://open.bigmodel.cn/](https://open.bigmodel.cn/) 注册并获取API Key
- **通义千问**: 访问 [https://dashscope.aliyun.com/](https://dashscope.aliyun.com/) 注册并获取API Key
- **OpenAI**: 访问 [https://platform.openai.com/](https://platform.openai.com/) 注册并获取API Key

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 🎭 角色介绍

1. **Sophie** - 活泼甜美的曼彻斯特大学生，热情友好
2. **Charlotte** - 时尚甜美的伦敦设计师，话题轻松有趣
3. **Olivia** - 温柔甜美的苏格兰医生，关心他人

所有角色都使用优化的甜美语音设置，提供更自然、更甜美的对话体验。

## 🛠️ 技术栈

- **Next.js 14** - React框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **智谱AI GLM-4** - AI对话（推荐）
- **通义千问 Qwen** - AI对话（备选）
- **OpenAI GPT-3.5** - AI对话（备用）
- **Web Speech API** - 语音识别和合成（浏览器内置）

## 📝 API说明

### POST /api/chat

对话和评分接口

**请求体：**
```json
{
  "messages": [...],
  "characterPersonality": "...",
  "userInput": "用户输入"
}
```

**响应：**
```json
{
  "response": "AI回复",
  "correction": {
    "original": "原句",
    "corrected": "纠正后",
    "explanation": "解释"
  },
  "score": {
    "pronunciation": 85,
    "fluency": 80,
    "accuracy": 90,
    "overall": 85
  }
}
```

## 💡 使用建议

1. **选择角色**：从3个甜美角色中选择你喜欢的对话伙伴
2. **语音输入**：点击麦克风图标使用语音输入
3. **查看纠正**：注意黄色提示框中的纠正建议
4. **关注评分**：查看蓝色评分框了解你的表现
5. **多练习**：与不同角色对话，提高英语水平

## 🔧 部署

### Vercel部署

详细部署指南请参考 [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

快速步骤：
1. 推送代码到GitHub
2. 在Vercel导入项目
3. 添加环境变量（AI API Key）
4. 部署完成

## 📄 许可证

MIT
