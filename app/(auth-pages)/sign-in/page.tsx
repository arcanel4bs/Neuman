"use client";

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  const returnTo = searchParams.get('returnTo') || '';
  const message: Message = searchParams.get('message') 
    ? { message: searchParams.get('message')! } 
    : {};

  async function handleSubmit(formData: FormData) {
    try {
      setIsLoading(true);
      const response = await signInAction(formData);
      
      if (response.error) {
        setIsLoading(false);
        return;
      }

      if (response.success && response.redirectTo) {
        router.push(response.redirectTo);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Sign in error:', error);
    }
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
            <h1 className="text-3xl text-white mb-2">Welcome back</h1>
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link className="text-white hover:text-blue-300 transition-colors font-medium" href="/sign-up">
                Sign-up
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Link
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                required
                className="mt-1 bg-gray-800/50 border-gray-700 focus:ring-blue-500 focus:border-transparent rounded-full"
              />
            </div>

            <Input
              type="hidden"
              name="returnTo"
              value={returnTo}
            />

            <SubmitButton 
              pendingText="Signing In..." 
              formAction={handleSubmit}
              className="w-full bg-gray-400 hover:bg-gray-200 mt-6 rounded-full transition-all transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign in"}
            </SubmitButton>
            
            <FormMessage message={message} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
