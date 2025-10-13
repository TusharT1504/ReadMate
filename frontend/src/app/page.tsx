'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Sparkles, Brain, Heart, Zap, Cloud, Clock, Camera, Book } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ReadMate
            </h1>
          </div>
          
          {/* Conditional Navigation */}
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <span className="px-4 py-2 text-gray-700 flex items-center gap-2">
                  👋 Hi, <span className="font-semibold">{user?.name}</span>
                </span>
                <button 
                  onClick={() => router.push('/discover')} 
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Discover Books
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => router.push('/login')} 
                  className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium transition"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push('/register')} 
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Book Recommendations
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Personal
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> AI Book </span>
            Companion
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Discover your next favorite book with intelligent recommendations powered by AI.
            ReadMate understands your mood, time, weather, and reading history to suggest
            the perfect books for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <button 
                onClick={() => router.push('/discover')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Start Discovering
              </button>
            ) : (
              <>
                <button 
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 bg-white text-purple-600 text-lg rounded-xl border-2 border-purple-600 hover:bg-purple-50 transition-all duration-200"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-purple-600" />}
            title="AI-Powered Intelligence"
            description="Advanced AI analyzes your reading history to understand your unique taste and preferences"
          />
          <FeatureCard
            icon={<Camera className="w-8 h-8 text-blue-600" />}
            title="Emotion Detection"
            description="Take a selfie and let AI detect your mood to recommend books that match your emotions"
          />
          <FeatureCard
            icon={<Cloud className="w-8 h-8 text-indigo-600" />}
            title="Context-Aware"
            description="Recommendations adapt to time of day, weather, and your current situation"
          />
          <FeatureCard
            icon={<Book className="w-8 h-8 text-purple-600" />}
            title="Vast Library"
            description="Access millions of books with detailed information from Google Books API"
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-pink-600" />}
            title="Personalized"
            description="Every recommendation is tailored specifically for you based on your reading history"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-600" />}
            title="Instant Discovery"
            description="Get 5 perfectly matched book recommendations in seconds, not hours"
          />
        </div>

        {/* How It Works Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How ReadMate Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Sign Up"
              description="Create your free account in seconds"
            />
            <StepCard
              number="2"
              title="Set Context"
              description="Share your mood, or let AI detect it from a photo"
            />
            <StepCard
              number="3"
              title="Get AI Recommendations"
              description="Receive 5 personalized book suggestions"
            />
            <StepCard
              number="4"
              title="Start Reading"
              description="Discover your next favorite book"
            />
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-32 text-center">
          <div className="inline-flex items-center gap-8 px-12 py-8 bg-white rounded-2xl shadow-xl">
            <div>
              <div className="text-4xl font-bold text-purple-600">10K+</div>
              <div className="text-gray-600 mt-2">Books Analyzed</div>
            </div>
            <div className="w-px h-16 bg-gray-200"></div>
            <div>
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600 mt-2">Match Accuracy</div>
            </div>
            <div className="w-px h-16 bg-gray-200"></div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">AI</div>
              <div className="text-gray-600 mt-2">Powered</div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        {!isAuthenticated && (
          <div className="mt-32 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
              <h2 className="text-4xl font-bold mb-4">Ready to Discover Your Next Favorite Book?</h2>
              <p className="text-xl mb-8 text-purple-100">Join thousands of readers finding their perfect matches</p>
              <button 
                onClick={() => router.push('/register')}
                className="px-10 py-4 bg-white text-purple-600 text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Start Free Today
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-900">ReadMate</span>
          </div>
          <p>Your AI-powered book recommendation companion</p>
          <p className="mt-2 text-sm">© 2025 ReadMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:transform hover:scale-105">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
