"use client"

import { useState, useEffect } from "react"
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
  const { context } = useRecommendationStore()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleGetRecommendations = async () => {
    if (!context.mood) {
      setError("Please select a mood first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.post("/recs/generate", {
        mood: context.mood,
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
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="glass p-6 mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Books</h1>
          <p className="text-muted">Get personalized recommendations based on your current mood and context</p>
        </div>

        {/* Context Selection */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-4">
              <MoodPicker />
            </div>
            <EmotionDetector
              onMoodDetected={(mood) => {
                useRecommendationStore.getState().setMood(mood)
              }}
            />
          </div>
          <div className="glass p-4">
            <TimeWeatherWidget />
          </div>
        </div>

        {/* Get Recommendations Button */}
        <div className="mb-8">
          <button onClick={handleGetRecommendations} disabled={loading || !context.mood} className="btn-primary">
            {loading ? (
              <>
                <span className="animate-spin" aria-hidden>
                  ⏳
                </span>
                Generating...
              </>
            ) : (
              <>✨ Get Recommendations</>
            )}
          </button>

          {error && <p className="mt-4 glass px-4 py-3 text-primary">{error}</p>}
        </div>

        {/* Recommendations Display */}
        {recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Powered by Google Gemini</span>
              </div>
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
