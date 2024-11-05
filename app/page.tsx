import Link from 'next/link'

export default async function Index() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
        <div className="text-2xl font-bold">Neuman</div>
        <div className="space-x-4">
          <Link 
            href="/sign-in" 
            className="text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link 
            href="/sign-up" 
            className="px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-800/70 text-white transition-all transform hover:scale-105"
          >
            Try Free
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
          Synthetic Data Engine
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Generate high-quality synthetic data for AI training and testing. 
          Power your models with unlimited, context-aware data.
          This product is currently experimental.
        </p>
        <Link 
          href="/sign-up" 
          className="inline-flex items-center px-8 py-3 text-lg rounded-full bg-gray-800/50 hover:bg-gray-800/70 text-white transition-all transform hover:scale-105"
        >
          Start Building for Free
        </Link>
      </div>
    </main>
  );
}
