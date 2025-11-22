'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Sparkles, Brain, Heart, Zap, Cloud, Clock, Camera, Book } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-white to-blue-50 flex flex-col">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              ReadMate
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => router.push('/discover')} 
                className="px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Discover
              </button>
            ) : (
              <>
                <button 
                  onClick={() => router.push('/login')} 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push('/register')} 
                  className="px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-medium"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-purple-100 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">AI-Powered Discovery</span>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
              Find your next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                favorite story.
              </span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Personalized book recommendations based on your mood, weather, and reading history.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button 
              onClick={() => router.push(isAuthenticated ? '/discover' : '/register')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium text-lg flex items-center gap-2 group"
            >
              {isAuthenticated ? 'Start Discovering' : 'Start Your Journey'}
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
            {!isAuthenticated && (
              <button 
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium text-lg"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Compact Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
            <CompactFeature 
              icon={<Brain className="w-5 h-5 text-purple-500" />}
              title="Smart AI"
              desc="Understands your unique taste"
            />
            <CompactFeature 
              icon={<Camera className="w-5 h-5 text-blue-500" />}
              title="Mood Sense"
              desc="Recommendations for how you feel"
            />
            <CompactFeature 
              icon={<Cloud className="w-5 h-5 text-indigo-500" />}
              title="Context Aware"
              desc="Adapts to weather & time"
            />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>© 2025 ReadMate. Crafted with ❤️ for readers.</p>
      </footer>
    </div>
  );
}

function CompactFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 pl-[3.25rem]">{desc}</p>
    </div>
  );
}
