'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { BookOpen, Sparkles, TrendingUp, Heart } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/discover');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">ReadMate</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push('/login')} className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium">
            Login
          </button>
          <button onClick={() => router.push('/register')} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Sign Up
          </button>
        </div>
      </nav>
    </div>
  );
}
