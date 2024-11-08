import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UserIcon } from '@/components/user-icon'
import { ThemeSwitcher } from '@/components/theme-switcher'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Terminal, BarChart2 } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-2xl text-white">Neuman</h1>
          <span className="text-sm text-gray-400">Dashboard</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                <Link href="/sign-out">Sign Out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-4rem)] border-r border-gray-800 p-4">
          <nav className="space-y-2">
            <Link 
              href="/console"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors"
            >
              <Terminal className="h-5 w-5" />
              Data Generation
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

        {/* Content Area */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}