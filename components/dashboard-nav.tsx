import Link from 'next/link'
import { Terminal, BarChart2, ArrowLeft } from 'lucide-react'

export function DashboardNav({ showBack = false }: { showBack?: boolean }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {showBack && (
        <Link 
          href="/dashboard" 
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <nav className="flex gap-4">
        <Link 
          href="/console"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors"
        >
          <Terminal className="h-5 w-5" />
          Console
        </Link>
        <Link 
          href="/data-ranking"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors"
        >
          <BarChart2 className="h-5 w-5" />
          Rankings
        </Link>
      </nav>
    </div>
  )
}