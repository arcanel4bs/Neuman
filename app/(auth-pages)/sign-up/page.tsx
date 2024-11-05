import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black relative">
        <Link 
          href="/" 
          className="absolute top-4 left-4 text-white hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-gray-800/30"
        >
          <IoArrowBack size={24} />
        </Link>
        <div className="w-full max-w-md px-4">
          <FormMessage message={searchParams} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative">
      <Link 
        href="/" 
        className="absolute top-4 left-4 text-white hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-gray-800/30"
      >
        <IoArrowBack size={24} />
      </Link>

      <div className="w-full max-w-md px-4">
        <form className="w-full bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-white mb-2">Get started</h1>
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link className="text-white hover:blue-300 transition-colors font-medium" href="/sign-in">
                Login
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input 
                name="email" 
                placeholder="you@example.com" 
                required 
                className="mt-1 bg-gray-800/50 border-gray-700 focus:ring-blue-500 focus:border-transparent rounded-full"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                minLength={6}
                required
                className="mt-1 bg-gray-800/50 border-gray-700 focus:ring-blue-500 focus:border-transparent rounded-full"
              />
            </div>

            <SubmitButton 
              formAction={signUpAction} 
              pendingText="Signing up..."
              className="w-full bg-gray-400 hover:bg-gray-200 mt-6 rounded-full transition-all transform hover:scale-105"
            >
              Sign-up
            </SubmitButton>
            
            <FormMessage message={searchParams} />
          </div>
        </form>
        
      </div>
    </div>
  );
}
