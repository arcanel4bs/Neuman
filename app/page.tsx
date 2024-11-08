import Link from 'next/link'
import { submitEarlyAccess } from './actions/early-access'
import { FormMessage, Message } from '@/components/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'

export const metadata = {
  title: 'Synthetic Data Engine',
  description: 'Generate large amounts of high-quality data.',
  alternates: {
    canonical: '/',
  }
};

export default async function Index({ 
  searchParams 
}: { 
  searchParams: Promise<{ message?: string }> 
}) {
  const params = await searchParams;
  let message: Message = { message: "" };
  
  if (params.message) {
    try {
      message = JSON.parse(params.message);
    } catch {
      message = { message: params.message };
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-800">
        <div className="text-xl sm:text-2xl font-light">Neuman</div>
        <div className="flex items-center gap-4">
          <Link 
            href="/sign-in" 
            className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-20 text-center">
        <h1 className="text-3xl sm:text-6xl font-light mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500 leading-tight">
          Synthetic Data Engine
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          Generate large amounts of high-quality data in seconds. 
          Visit our <Link href={'/data-ranking'} className="text-transparent bg-gradient-to-r from-blue-400">data ranking system</Link> to check out how our users are using Neuman.
          
        </p>
        
        <div className="mb-8 sm:mb-12 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full"
          >
            <source src="/neuman-demo.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="max-w-md mx-auto mb-8 sm:mb-12">
          <form className="flex flex-col gap-4" action={submitEarlyAccess}>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email for early access"
                required
                className="flex-1 bg-gray-800/50 border-gray-700 focus:ring-blue-500 focus:border-transparent rounded-full text-sm"
              />
              <SubmitButton 
                pendingText="Submitting..."
                className="bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-full px-6 py-2 text-sm"
              >
                Join
              </SubmitButton>
            </div>
            <FormMessage message={message} />
          </form>
        </div>

        
      </div>
    </main>
  );
}