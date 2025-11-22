"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import type { Book } from "@/types"
import BookCard from "@/components/BookCard"
import Navigation from "@/components/Navigation"
import { Heart } from "lucide-react"

export default function FavoritesPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [favorites, setFavorites] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchFavorites = async () => {
      try {
        const response = await api.get("/users/me/favorites")
        setFavorites(response.data.data.favorites)
      } catch (error) {
        console.error("Failed to fetch favorites", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-sm text-gray-500">Books you've saved for later</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start exploring to find books you love!</p>
            <button 
              onClick={() => router.push('/discover')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Discover Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
