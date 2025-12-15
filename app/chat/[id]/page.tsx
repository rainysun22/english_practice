'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Mic, Send, Volume2, ArrowLeft, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Correction {
  original: string
  corrected: string
  explanation: string
}

interface Score {
  pronunciation: number
  fluency: number
  accuracy: number
  overall: number
}

const characters: Record<string, { name: string; avatar: string; color: string; personality: string; voiceSettings: { pitch: number; rate: number } }> = {
  sophie: {
    name: 'Sophie',
    avatar: '👩‍🎓',
    color: 'from-pink-500 to-rose-500',
    personality: 'You are Sophie, a cheerful and sweet university student from Manchester in her early 20s. You speak with a warm, friendly British accent. You are enthusiastic, friendly, and love talking about student life, music, travel, and social activities. You use casual British slang and expressions. You are very encouraging, make learning fun, and always speak in a warm, sweet, and approachable manner.',
    voiceSettings: { pitch: 1.3, rate: 0.65 } // 更高音调，更甜美
  },
  charlotte: {
    name: 'Charlotte',
    avatar: '👩‍🎨',
    color: 'from-purple-500 to-pink-500',
    personality: 'You are Charlotte, a trendy and sweet London fashion designer in her mid-20s. You speak with a modern, pleasant London accent. You love discussing fashion, design, pop culture, and lifestyle. You are creative, trendy, and use contemporary British expressions. You make conversations engaging and fun, perfect for casual English practice. Your voice is sweet, friendly, and always cheerful.',
    voiceSettings: { pitch: 1.25, rate: 0.7 } // 甜美时尚的声音
  },
  olivia: {
    name: 'Olivia',
    avatar: '👩‍⚕️',
    color: 'from-green-500 to-emerald-500',
    personality: 'You are Olivia, a caring and sweet Scottish doctor in her early 30s. You speak with a gentle, warm Scottish accent. You are compassionate, patient, and love discussing health, wellness, nature, and helping others. You use warm, encouraging language with a sweet, gentle tone. You are perfect for learners who want a supportive, kind conversation partner.',
    voiceSettings: { pitch: 1.2, rate: 0.6 } // 温柔甜美的声音
  },
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.id as string
  const character = characters[characterId] || characters.emma

  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [correction, setCorrection] = useState<Correction | null>(null)
  const [score, setScore] = useState<Score | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const messagesRef = useRef<Message[]>(messages)
  const isLoadingRef = useRef<boolean>(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    messagesRef.current = messages
  }, [messages])
  
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.lang = 'en-GB'
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false

        recognitionInstance.onstart = () => {
          console.log('语音识别已开始')
          setIsListening(true)
        }

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          console.log('语音识别结果:', event)
          const transcript = event.results[0][0].transcript
          console.log('识别文本:', transcript)
          setInput(transcript)
          setIsListening(false)
          toast.success('语音识别完成')
          
          // 自动发送语音识别的结果
          setTimeout(() => {
            if (transcript.trim() && !isLoadingRef.current) {
              handleSendWithText(transcript.trim())
            }
          }, 300)
        }
        
        recognitionInstance.onend = () => {
          console.log('语音识别已结束')
          setIsListening(false)
        }

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('语音识别错误:', event.error, event.message)
          setIsListening(false)
          
          let errorMessage = '语音识别失败'
          switch (event.error) {
            case 'no-speech':
              errorMessage = '未检测到语音，请重新尝试'
              break
            case 'audio-capture':
              errorMessage = '无法访问麦克风，请检查权限设置'
              break
            case 'not-allowed':
              errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问'
              break
            case 'network':
              errorMessage = '网络错误，请检查网络连接'
              break
            default:
              errorMessage = `语音识别错误: ${event.error}`
          }
          toast.error(errorMessage)
        }

        recognitionInstance.onaudiostart = () => {
          console.log('开始接收音频')
        }

        recognitionInstance.onaudioend = () => {
          console.log('停止接收音频')
        }

        recognitionInstance.onsoundstart = () => {
          console.log('检测到声音')
        }

        recognitionInstance.onsoundend = () => {
          console.log('声音结束')
        }

        recognitionInstance.onspeechstart = () => {
          console.log('检测到语音')
        }

        recognitionInstance.onspeechend = () => {
          console.log('语音结束')
        }

        setRecognition(recognitionInstance)
      }

      synthRef.current = window.speechSynthesis
      
      // 加载可用语音并选择最甜美的
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        setAvailableVoices(voices)
        
        // 优先选择女性、英音、甜美的语音
        // 查找包含 "female", "woman", "UK", "GB", "British" 的语音
        const preferredVoices = voices.filter(voice => {
          const name = voice.name.toLowerCase()
          const lang = voice.lang.toLowerCase()
          return (
            (name.includes('female') || name.includes('woman') || name.includes('zira') || name.includes('hazel') || name.includes('susan')) &&
            (lang.includes('en-gb') || lang.includes('en-us') || lang.includes('en'))
          )
        })
        
        if (preferredVoices.length > 0) {
          // 选择第一个匹配的语音
          setSelectedVoice(preferredVoices[0])
        } else if (voices.length > 0) {
          // 如果没有找到，选择第一个女性语音或默认语音
          const femaleVoice = voices.find(v => 
            v.name.toLowerCase().includes('female') || 
            v.name.toLowerCase().includes('woman') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('hazel')
          )
          setSelectedVoice(femaleVoice || voices[0])
        }
      }
      
      // 立即加载
      loadVoices()
      
      // 某些浏览器需要等待voiceschanged事件
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
      
      // 初始化欢迎消息并自动播放
      if (!isInitialized) {
        const welcomeMessage = `Hello! I'm ${character.name}. I'm here to help you practice British English. Let's have a conversation! What would you like to talk about?`
        setMessages([{
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
        }])
        setIsInitialized(true)
        
        // 延迟播放欢迎语音，等待语音加载
        setTimeout(() => {
          speakText(welcomeMessage)
        }, 800)
      }
    }
  }, [character.name, isInitialized])

  const speakText = (text: string) => {
    // 停止之前的浏览器TTS
    if (synthRef.current) {
      synthRef.current.cancel()
    }

    // 使用浏览器内置TTS
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // 使用角色特定的语音设置（更甜美）
      const voiceSettings = character.voiceSettings || { pitch: 1.2, rate: 0.65 }
      utterance.lang = 'en-GB'
      utterance.rate = voiceSettings.rate  // 慢速，更清晰
      utterance.pitch = voiceSettings.pitch  // 提高音调，更甜美
      utterance.volume = 1.0
      
      // 如果找到了合适的语音，使用它
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
      
      synthRef.current.speak(utterance)
    }
  }

  const handleSendWithText = async (text: string) => {
    if (!text.trim() || isLoadingRef.current) return

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    const currentMessages = [...messagesRef.current, userMessage]
    setMessages(currentMessages)
    setInput('')
    setIsLoading(true)
    setCorrection(null)
    setScore(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: currentMessages,
          characterPersonality: character.personality,
          userInput: text.trim(),
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        setIsLoading(false)
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (data.correction) {
        setCorrection(data.correction)
      }

      if (data.score) {
        setScore(data.score)
      }

      // 自动播放AI回复（慢速）
      setTimeout(() => {
        speakText(data.response)
      }, 500)
    } catch (error) {
      console.error('Error:', error)
      toast.error('发送失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => {
    if (input.trim()) {
      handleSendWithText(input.trim())
    }
  }

  const handleVoiceInput = async () => {
    if (!recognition) {
      toast.error('您的浏览器不支持语音识别，请使用Chrome或Edge浏览器')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
      toast('已停止录音', { icon: 'ℹ️' })
      return
    }

    // 请求麦克风权限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // 立即停止，只是测试权限
      
      // 权限已授予，开始语音识别
      setIsListening(true)
      recognition.start()
      toast.success('开始录音，请说话...')
    } catch (error: any) {
      console.error('麦克风权限错误:', error)
      setIsListening(false)
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error('麦克风权限被拒绝，请在浏览器设置中允许麦克风访问')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.error('未找到麦克风设备，请检查设备连接')
      } else {
        toast.error('无法访问麦克风: ' + error.message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className={`bg-gradient-to-r ${character.color} text-white shadow-lg`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{character.avatar}</span>
                <div>
                  <h1 className="text-2xl font-bold">{character.name}</h1>
                  <p className="text-sm opacity-90">英音口语练习</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Chat Area */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? `bg-gradient-to-r ${character.color} text-white`
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-semibold opacity-70">{character.name}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => speakText(message.content)}
                      className="mt-2 text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      重新播放
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Correction - 只在有实际错误时显示 */}
            {correction && 
             correction.explanation && 
             correction.explanation.trim() !== '' && 
             correction.corrected !== correction.original && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  纠正建议
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">原句：</span>
                    <span className="line-through text-red-600 ml-2">{correction.original}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">建议：</span>
                    <span className="text-green-600 font-semibold ml-2">{correction.corrected}</span>
                  </div>
                  <p className="text-gray-700 mt-2">{correction.explanation}</p>
                </div>
              </div>
            )}

            {/* Score */}
            {score && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  评分结果
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">发音</span>
                      <span className="font-semibold text-blue-600">{score.pronunciation}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${score.pronunciation}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">流利度</span>
                      <span className="font-semibold text-blue-600">{score.fluency}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${score.fluency}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">准确性</span>
                      <span className="font-semibold text-blue-600">{score.accuracy}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${score.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 font-semibold">总分</span>
                      <span className={`font-bold text-lg ${
                        score.overall >= 80 ? 'text-green-600' :
                        score.overall >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {score.overall}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          score.overall >= 80 ? 'bg-green-500' :
                          score.overall >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score.overall}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - 语音优先 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col gap-3">
              {/* 语音输入按钮（主要方式） */}
              <div className="flex justify-center">
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`w-20 h-20 rounded-full transition-all flex items-center justify-center ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse scale-110'
                      : `bg-gradient-to-r ${character.color} text-white hover:scale-105`
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                >
                  <Mic className="w-8 h-8" />
                </button>
              </div>
              
              {/* 显示当前识别的文本 */}
              {input && (
                <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                  {input}
                </div>
              )}
              
              {/* 文字输入（备用） */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="或输入文字回复..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading || isListening}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`px-6 py-3 bg-gradient-to-r ${character.color} text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Send className="w-5 h-5" />
                  发送
                </button>
              </div>
              
              {/* 提示 */}
              <p className="text-center text-xs text-gray-500">
                {isListening ? '正在录音...' : '点击麦克风开始语音对话'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

