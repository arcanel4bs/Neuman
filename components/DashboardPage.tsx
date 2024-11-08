'use client'

import Link from 'next/link'
import { Terminal, BarChart2 } from 'lucide-react'

interface DashboardPageProps {
  sessionId: string
}

export default function DashboardPage({ sessionId }: DashboardPageProps) {
  return (
    <div className="max-w-6xl mx-auto p-8">
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href={`/console/${sessionId}`}
          className="p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-black transition-all hover:scale-[1.02]"
        >
          <Terminal className="h-6 w-6 mb-4 text-primary" />
          <h2 className="text-xl font-light mb-2">Data Generation</h2>
          <p className="text-gray-300">Generate synthetic data using our advanced AI engine</p>
        </Link>

        <Link 
          href={`/data-ranking/${sessionId}`}
          className="p-4 rounded-xl border border-gray-800 hover:border-gray-700 bg-black transition-all hover:scale-[1.02]"
        >
          <BarChart2 className="h-6 w-6 mb-4 text-primary" />
          <h2 className="text-xl font-light mb-2">Rankings</h2>
          <p className="text-gray-300">View and interact with top-rated data generations</p>
        </Link>
      </div>
    </div>
  )
}
