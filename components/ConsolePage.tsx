'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { UserIcon } from '@/components/user-icon'
import { IoSend } from 'react-icons/io5'
import { FaCode, FaCopy, FaDownload, FaStar } from 'react-icons/fa'
import { BsDatabase } from 'react-icons/bs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

interface ConsolePageProps {
  sessionId: string
}

export default function ConsolePage({ sessionId }: ConsolePageProps) {
  const [prompt, setPrompt] = useState('')
  const [format, setFormat] = useState('JSON')
  const [dataSize, setDataSize] = useState('small')
  const [generatedData, setGeneratedData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const promptSuggestions = [
    'medical diagnosis and treatment ai assistant',
    'customer support chatbot',
    'product recommendation assistant'
  ]
  const [rating, setRating] = useState<number>(0)

  const trimTitle = (title: string) => {
    const words = title.split(' ')
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false);
    setIsLoading(true)
    setError(null)
    setGeneratedData('')
    setProgress(0)

    try {
      const response = await fetch('/api/generate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId || 'default'
        },
        body: JSON.stringify({
          prompt,
          format,
          dataSize
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setGeneratedData(data.data);
        setProgress(100);
      }
    } catch (error) {
      setError('An error occurred while generating data');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedData)
      toast.success('Copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generatedData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRating = async (stars: number) => {
    setRating(stars)
    // Add your API call here to save the rating
    toast.success('Thanks for rating!')
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex flex-col items-center px-4 sm:px-6 py-4 border-b border-gray-800 relative">
        <Link 
          href="/dashboard" 
          className="absolute left-4 sm:left-6 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        
        <div className="absolute left-12 sm:left-16 text-lg text-white">Neuman</div>
        
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl text-white font-light">Synthetic Data Engine</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Generate high-quality data</p>
        </div>
        
        <div className="absolute right-4 sm:right-6 flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-black border border-gray-800">
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/api-keys">API Keys</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/logout">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-[calc(100vh-8rem)]">
        <div className="p-4 sm:p-6">
          <div className="h-full flex flex-col max-w-4xl mx-auto">
            {generatedData && (
              <div className="flex-1 mb-4 sm:mb-6">
                <div className="bg-black border border-gray-800 rounded-2xl relative shadow-lg">
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`text-lg ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-400'
                          } hover:text-yellow-400 transition-colors`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-white"
                    >
                      <FaCopy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="text-gray-400 hover:text-white"
                    >
                      <FaDownload className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <div className="p-4">
                      <pre className="text-white whitespace-pre-wrap text-xs sm:text-sm font-mono leading-relaxed">
                        {generatedData}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 sm:mb-6 bg-red-900/20 border border-red-500 text-red-500 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {showSuggestions && !generatedData && (
              <div className="flex flex-wrap gap-2 mb-4">
                {promptSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setPrompt(suggestion)
                      setShowSuggestions(false)
                    }}
                    className="text-xs sm:text-sm bg-black border border-gray-800 hover:border-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {trimTitle(suggestion)}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative mt-auto">
              <div className="flex gap-2 items-center bg-black border border-gray-800 rounded-full p-1.5 sm:p-2">
                <div className="flex gap-1 sm:gap-2 px-2">
                  <div className="relative">
                    <FaCode className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                    <select
                      id="format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="appearance-none bg-transparent text-gray-400 text-xs sm:text-sm focus:outline-none pl-6 sm:pl-8 pr-4 sm:pr-6 py-1"
                    >
                      <option value="JSON">JSON</option>
                      <option value="CSV" disabled>CSV (Soon)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-center gap-2">
            <BsDatabase className="w-4 h-4 text-gray-400" />
            
          </div>
                  <div className="relative">
                    <select
                      id="dataSize"
                      value={dataSize}
                      onChange={(e) => setDataSize(e.target.value)}
                      className="appearance-none bg-transparent text-gray-400 text-xs sm:text-sm focus:outline-none pr-4 sm:pr-6 py-1"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the data you want..."
                  className="flex-1 bg-gray-800/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-transparent border-none text-white placeholder-gray-500 focus:outline-none min-w-0"
                />

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  size="icon"
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 bg-black hover:bg-gray-800 flex-shrink-0"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IoSend className="text-white text-sm sm:text-base" />
                  )}
                </Button>
              </div>

              {isLoading && (
                <div className="absolute -top-6 sm:-top-8 left-0 right-0">
                  <div className="w-full bg-gray-800/50 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}