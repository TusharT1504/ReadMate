"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useRecommendationStore } from "@/store/recommendationStore"
import api from "@/lib/api"
import type { Recommendation } from "@/types"
import MoodPicker from "@/components/MoodPicker"
import TimeWeatherWidget from "@/components/TimeWeatherWidget"
import BookCard from "@/components/BookCard"
import AIBookCard from "@/components/AIBookCard"
import Navigation from "@/components/Navigation"
import EmotionDetector from "@/components/EmotionDetector"

export default function DiscoverPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { context, recommendations, hasInitialized, setRecommendations, setHasInitialized } = useRecommendationStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const lastContextRef = useRef<string>("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (!hasInitialized) {
      // Only fetch initial recommendations once (stored in global state)
      handleGetRecommendations(true)
      setHasInitialized(true)
    }
  }, [isAuthenticated, router, hasInitialized])

  // Watch for context changes
  useEffect(() => {
    if (!isAuthenticated || !hasInitialized) return

    const currentContext = JSON.stringify({
      mood: context.mood,
      timeOfDay: context.timeOfDay,
      weather: context.weather
    })

    // Only fetch if context has actually changed (skip initial empty context)
    if (lastContextRef.current && lastContextRef.current !== currentContext) {
      handleGetRecommendations(false)
    }

    lastContextRef.current = currentContext
  }, [context.mood, context.timeOfDay, context.weather])

  const handleGetRecommendations = async (isInitial = false, moodOverride?: string) => {
    const moodToUse = moodOverride || context.mood
    if (!moodToUse && !isInitial) {
      setError("Please select a mood first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.post("/recs/generate", {
        mood: moodToUse,
        timeOfDay: context.timeOfDay,
        weather: context.weather,
      })

      setRecommendations(response.data.data.recommendations)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get recommendations")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header & Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discover Books</h1>
              <p className="text-sm text-gray-500">AI-powered recommendations based on your context</p>
            </div>
            
            <button 
              onClick={() => handleGetRecommendations(false)} 
              disabled={loading || !context.mood} 
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating...
                </>
              ) : (
                <>✨ Generate New Recommendations</>
              )}
            </button>
          </div>

          {/* Compact Control Grid */}
          <div className="grid lg:grid-cols-12 gap-4">
            {/* Mood Section - Takes 7 columns */}
            <div className="lg:col-span-7 space-y-3">
              <MoodPicker />
              <EmotionDetector
                onMoodDetected={(mood) => {
                  useRecommendationStore.getState().setMood(mood)
                  handleGetRecommendations(false, mood)
                }}
              />
            </div>
            
            {/* Context Section - Takes 5 columns */}
            <div className="lg:col-span-5">
              <TimeWeatherWidget />
            </div>
          </div>
        </div>

        {error && <p className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">{error}</p>}

        {/* Recommendations Display */}
        {recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recommendations</h2>
            
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <AIBookCard key={rec.googleBooksId || index} recommendation={rec} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        {!loading && recommendations.length === 0 && (
          <div className="glass text-center py-16">
            <div className="text-6xl mb-4" aria-hidden>
              📚
            </div>
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted">Select your mood and click "Get Recommendations" to start</p>
          </div>
        )}
      </div>
    </div>
  )
}
