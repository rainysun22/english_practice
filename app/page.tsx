'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, MessageCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface Character {
  id: string
  name: string
  description: string
  avatar: string
  personality: string
  color: string
}

const characters: Character[] = [
  {
    id: 'sophie',
    name: 'Sophie',
    description: '活泼甜美的曼彻斯特大学生，热情友好',
    avatar: '👩‍🎓',
    personality: 'You are Sophie, a cheerful and sweet university student from Manchester in her early 20s. You speak with a warm, friendly British accent. You are enthusiastic, friendly, and love talking about student life, music, travel, and social activities. You use casual British slang and expressions. You are very encouraging, make learning fun, and always speak in a warm, sweet, and approachable manner.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'charlotte',
    name: 'Charlotte',
    description: '时尚甜美的伦敦设计师，话题轻松有趣',
    avatar: '👩‍🎨',
    personality: 'You are Charlotte, a trendy and sweet London fashion designer in her mid-20s. You speak with a modern, pleasant London accent. You love discussing fashion, design, pop culture, and lifestyle. You are creative, trendy, and use contemporary British expressions. You make conversations engaging and fun, perfect for casual English practice. Your voice is sweet, friendly, and always cheerful.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'olivia',
    name: 'Olivia',
    description: '温柔甜美的苏格兰医生，关心他人',
    avatar: '👩‍⚕️',
    personality: 'You are Olivia, a caring and sweet Scottish doctor in her early 30s. You speak with a gentle, warm Scottish accent. You are compassionate, patient, and love discussing health, wellness, nature, and helping others. You use warm, encouraging language with a sweet, gentle tone. You are perfect for learners who want a supportive, kind conversation partner.',
    color: 'from-green-500 to-emerald-500'
  },
]

export default function Home() {
  const router = useRouter()
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const handleStartChat = (character: Character) => {
    router.push(`/chat/${character.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              英音口语对话
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            与多种角色练习英音英语
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <Star className="w-5 h-5 fill-yellow-500" />
            <span className="text-sm font-semibold">实时纠正 · 智能打分 · 英音发音</span>
          </div>
        </motion.div>

        {/* Character Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {characters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => handleStartChat(character)}
            >
              <div className={`h-32 bg-gradient-to-r ${character.color} flex items-center justify-center`}>
                <span className="text-6xl">{character.avatar}</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{character.name}</h3>
                <p className="text-gray-600 mb-4">{character.description}</p>
                <button
                  className={`w-full py-3 bg-gradient-to-r ${character.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all transform group-hover:scale-105 flex items-center justify-center gap-2`}
                >
                  <MessageCircle className="w-5 h-5" />
                  开始对话
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">核心功能</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">自然对话</h3>
                <p className="text-gray-600 text-sm">与AI角色进行真实对话练习</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">实时纠正</h3>
                <p className="text-gray-600 text-sm">即时获得语法和表达建议</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">智能打分</h3>
                <p className="text-gray-600 text-sm">评估发音、流利度和准确性</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
