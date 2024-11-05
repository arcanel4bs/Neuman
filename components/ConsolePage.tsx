'use client'

import { useState } from 'react'
import GenerationHistory from './GenerationHistory'
import { Button } from './ui/button'
import Link from 'next/link'
import { UserIcon } from '@/components/user-icon'
import { IoSend } from 'react-icons/io5'
import { FaCode } from 'react-icons/fa'
import { BsDatabase } from 'react-icons/bs'

export default function ConsolePage() {
  const [prompt, setPrompt] = useState('')
  const [format, setFormat] = useState('JSON')
  const [dataSize, setDataSize] = useState('small')
  const [generatedData, setGeneratedData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true);
  const promptSuggestions = [
    'stock market broker guru',
    'medical diagnosis and treatment ai assistant'
  ];

  const trimTitle = (title: string) => {
    const words = title.split(' ');
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  };

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

  return (
    <div className="min-h-screen bg-black">
      <div className="flex flex-col items-center px-6 py-4 border-b border-gray-800">
        <h1 className="text-3xl font-semibold text-white">Neuman</h1>
        <p className="text-gray-400 text-sm mt-1">Synthetic Data Engine</p>
        <div className="absolute right-6">
          <Link href="/profile" aria-label="Profile Settings">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white"
            >
              <span className="sr-only">Profile Settings</span>
              <UserIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex h-[calc(100vh-8rem)]">
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {generatedData && (
              <div className="flex-1 overflow-hidden mb-6">
                <div className="bg-gray-800/50 p-4 rounded-2xl h-full overflow-auto">
                  <pre className="text-white whitespace-pre-wrap">{generatedData}</pre>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-900/20 border border-red-500 text-red-500 p-4 rounded-2xl">
                {error}
              </div>
            )}

            {showSuggestions && !generatedData && (
              <div className="flex gap-2 mb-4">
                {promptSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setPrompt(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="text-sm bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div className="flex gap-2 items-center bg-gray-800/30 rounded-full p-2">
                <div className="flex gap-2 px-2">
                  <div className="relative">
                    <FaCode className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <select
                      id="format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="appearance-none bg-transparent text-gray-400 text-sm focus:outline-none pl-8 pr-6 py-1"
                      aria-label="Data Format"
                    >
                      <option value="JSON">JSON</option>
                      <option value="CSV" disabled className="text-gray-600">CSV (Coming Soon)</option>
                    </select>
                    <BsDatabase className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                  <div className="relative">
                    <select
                      id="dataSize"
                      value={dataSize}
                      onChange={(e) => setDataSize(e.target.value)}
                      className="appearance-none bg-transparent text-gray-400 text-sm focus:outline-none pr-6 py-1"
                      aria-label="Data Size"
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
                  placeholder="Describe the data you want to generate..."
                  className="flex-1 bg-gray-800/50 rounded-full px-4 py-2 text-sm bg-transparent border-none text-white placeholder-gray-500 focus:outline-none"
                />

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  size="icon"
                  className="rounded-full w-10 h-10 bg-black hover:bg-gray-800"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IoSend className="text-white" />
                  )}
                </Button>
              </div>

              {isLoading && (
                <div className="absolute -top-8 left-0 right-0">
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

        <div className="w-80 border-l border-gray-800 p-6 overflow-auto">
          <GenerationHistory />
        </div>
      </div>
    </div>
  )
}