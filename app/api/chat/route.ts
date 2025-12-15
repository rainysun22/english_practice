import { NextRequest, NextResponse } from 'next/server'

// 支持的AI提供商类型
type AIProvider = 'zhipu' | 'qwen' | 'openai'

// 获取AI配置
function getAIConfig() {
  const provider = (process.env.AI_PROVIDER || 'zhipu') as AIProvider

  if (provider === 'zhipu') {
    // 智谱AI (GLM-4) - 推荐，对话效果好
    return {
      provider: 'zhipu',
      apiKey: process.env.ZHIPU_API_KEY,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4',
    }
  } else if (provider === 'qwen') {
    // 通义千问 (Qwen)
    return {
      provider: 'qwen',
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-turbo',
    }
  } else {
    // OpenAI (备用)
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
    }
  }
}

// 调用AI API
async function callAI(messages: any[], config: any, options: { temperature?: number; max_tokens?: number } = {}) {
  const { provider, apiKey, baseURL, model } = config
  const { temperature = 0.7, max_tokens = 500 } = options

  if (!apiKey) {
    throw new Error(`${provider} API key not configured`)
  }

  // 智谱AI需要特殊处理
  if (provider === 'zhipu') {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Zhipu AI API error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'I apologize, I did not understand that.'
  }

  // 通义千问和OpenAI使用相同格式
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`${provider} API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'I apologize, I did not understand that.'
}

export async function POST(request: NextRequest) {
  try {
    const { messages, characterPersonality, userInput } = await request.json()
    const config = getAIConfig()

    // Create conversation history with system prompt
    const systemPrompt = `${characterPersonality}

Important instructions:
1. Always respond in British English with appropriate accent characteristics
2. Keep responses SHORT and natural (1-2 sentences maximum)
3. If the user's English is correct, simply praise them briefly (e.g., "Brilliant!" or "Well said!") - NO explanations
4. Only provide corrections or suggestions when there are actual mistakes
5. Be encouraging and friendly
6. Use appropriate British expressions and vocabulary
7. Respond quickly and concisely`

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Get AI response
    const response = await callAI(conversationMessages, config, {
      temperature: 0.7,
      max_tokens: 150, // 减少token数量，提升速度
    })

    // Analyze user input for corrections and scoring
    const analysisPrompt = `Analyze this English sentence: "${userInput}"

Rules:
- If the sentence is CORRECT, set "corrected" to the same as "original" and "explanation" to empty string ""
- Only provide corrections if there are actual mistakes
- Keep explanations brief (one sentence max)

Respond in JSON format:
{
  "correction": {
    "original": "original text",
    "corrected": "corrected text or same as original if perfect",
    "explanation": "brief explanation or empty string if perfect"
  },
  "score": {
    "pronunciation": 85,
    "fluency": 80,
    "accuracy": 90,
    "overall": 85
  }
}`

    const analysisMessages = [
      { role: 'system', content: 'You are an expert British English teacher. Respond only in valid JSON format.' },
      { role: 'user', content: analysisPrompt },
    ]

    const analysisResponse = await callAI(analysisMessages, config, {
      temperature: 0.3,
      max_tokens: 200, // 减少token数量，提升速度
    })

    let correction = null
    let score = null

    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        correction = analysis.correction
        score = analysis.score
      }
    } catch (error) {
      console.error('Error parsing analysis:', error)
      // Provide default scores if parsing fails
      score = {
        pronunciation: 75,
        fluency: 75,
        accuracy: 80,
        overall: 77,
      }
    }

    return NextResponse.json({
      response,
      correction,
      score,
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
