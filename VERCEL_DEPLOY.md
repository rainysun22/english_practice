# Vercel部署指南 🚀

## 快速部署步骤

### 1. 准备代码

确保代码已推送到GitHub仓库。

### 2. 在Vercel部署

1. 访问 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 导入你的GitHub仓库
4. 配置项目设置：
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. 配置环境变量

在Vercel项目设置中添加以下环境变量：

#### 必需的环境变量

**AI对话服务（选择一个）：**

**选项1：智谱AI（推荐，对话效果好）**
```env
AI_PROVIDER=zhipu
ZHIPU_API_KEY=your_zhipu_api_key
```

**选项2：通义千问**
```env
AI_PROVIDER=qwen
DASHSCOPE_API_KEY=your_dashscope_api_key
```

**选项3：OpenAI（备用）**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
```

### 4. 部署

点击 "Deploy" 按钮，等待部署完成。

### 5. 测试

部署完成后：
1. 访问你的Vercel域名
2. 选择一个角色开始对话
3. 测试语音播放功能（使用浏览器内置TTS）
4. 检查浏览器控制台是否有错误

---

## 获取API密钥

### 智谱AI（推荐）

1. 访问 [https://open.bigmodel.cn/](https://open.bigmodel.cn/)
2. 注册并登录
3. 在控制台创建API Key

### 通义千问

1. 访问 [https://dashscope.aliyun.com/](https://dashscope.aliyun.com/)
2. 使用阿里云账号登录
3. 开通服务并创建API Key

### OpenAI

1. 访问 [https://platform.openai.com/](https://platform.openai.com/)
2. 注册并登录
3. 在API Keys页面创建API Key

---

## 功能说明

### 语音功能

- **语音输入**：使用浏览器内置的Web Speech API进行语音识别
- **语音播放**：使用浏览器内置的SpeechSynthesis API进行语音合成
- **无需额外配置**：所有语音功能都在浏览器端完成，无需服务器端TTS服务

### 角色

应用包含3个甜美角色：
1. **Sophie** - 活泼甜美的曼彻斯特大学生
2. **Charlotte** - 时尚甜美的伦敦设计师
3. **Olivia** - 温柔甜美的苏格兰医生

---

## 部署后检查清单

- [ ] 环境变量已正确配置
- [ ] 应用可以正常访问
- [ ] AI对话功能正常
- [ ] 语音播放功能正常（浏览器TTS）
- [ ] 语音输入功能正常（浏览器语音识别）
- [ ] 没有控制台错误
- [ ] 移动端访问正常

---

## 常见问题

### Q: 部署后语音不工作？

A: 
1. 检查浏览器是否支持Web Speech API
2. 检查浏览器权限（麦克风和音频播放）
3. 查看浏览器控制台错误
4. 某些浏览器可能需要HTTPS才能使用语音功能

### Q: 如何更新环境变量？

A: 
1. 在Vercel项目设置中修改环境变量
2. 重新部署项目（会自动触发）

### Q: 如何查看部署日志？

A: 
1. 在Vercel项目页面
2. 点击"Deployments"
3. 选择最新的部署
4. 查看"Functions"标签页的日志

### Q: 浏览器TTS声音不够甜美？

A: 
- 浏览器TTS的声音取决于操作系统和浏览器
- 不同浏览器和操作系统可能有不同的声音选项
- 应用会自动选择最合适的女性英音声音

---

## 成本参考

### AI对话（智谱AI）

- GLM-4: 约¥0.1/1K tokens
- 每次对话约500-1000 tokens
- 成本很低

### 语音功能

- **完全免费！** 使用浏览器内置API，无需额外费用
- 语音识别：Web Speech API（浏览器内置）
- 语音合成：SpeechSynthesis API（浏览器内置）

---

## 推荐配置

**最佳配置（推荐）**：
- AI: 智谱AI GLM-4
- TTS: 浏览器内置（SpeechSynthesis）
- 语音识别: 浏览器内置（Web Speech API）

**完全免费配置**：
- AI: 智谱AI GLM-4（有免费额度）
- TTS: 浏览器内置（完全免费）
- 语音识别: 浏览器内置（完全免费）

---

## 技术支持

如有问题，请检查：
1. Vercel部署日志
2. 浏览器控制台错误
3. 环境变量配置
4. API密钥是否有效
