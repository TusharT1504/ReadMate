"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import type { Book } from "@/types"
import Navigation from "@/components/Navigation"

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [likeNote, setLikeNote] = useState("")
  const [likeTags, setLikeTags] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchBook()
  }, [params.id, isAuthenticated])

  const fetchBook = async () => {
    try {
      const response = await api.get(`/books/${params.id}`)
      setBook(response.data.data.book)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load book")
    } finally {
      setLoading(false)
    }
  }

  const handleLikeSection = async (section: any) => {
    try {
      await api.post("/users/me/like-section", {
        bookId: book?._id,
        sectionId: section.id,
        text: section.textSnippet,
        tags: likeTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        note: likeNote,
      })

      alert("Section saved successfully!")
      setSelectedSection(null)
      setLikeNote("")
      setLikeTags("")
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save section")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="glass animate-pulse p-6">
            <div className="h-12 bg-white/20 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-white/20 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="glass text-center p-8">
            <div className="text-6xl mb-4" aria-hidden>
              😕
            </div>
            <h2 className="text-2xl font-bold mb-2">Book Not Found</h2>
            <p className="text-muted mb-6">{error}</p>
            <button onClick={() => router.push("/discover")} className="btn-primary">
              Back to Discover
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-muted hover:text-foreground transition"
        >
          ← Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="glass p-6 sticky top-6">
              <div
                className="aspect-[2/3] rounded-lg flex items-center justify-center text-white mb-4"
                style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
              >
                <div className="text-center px-4">
                  <div className="text-6xl mb-4" aria-hidden>
                    📚
                  </div>
                  <p className="text-lg font-medium">{book.title}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Rating:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-accent" aria-hidden>
                      ⭐
                    </span>
                    <span className="font-medium">{book.popularity.ratings.average.toFixed(1)}</span>
                    <span className="text-muted">({book.popularity.ratings.count})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Reads:</span>
                  <span className="font-medium">{book.popularity.reads}</span>
                </div>

                {book.metadata.pages && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Pages:</span>
                    <span className="font-medium">{book.metadata.pages}</span>
                  </div>
                )}

                {book.metadata.language && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Language:</span>
                    <span className="font-medium uppercase">{book.metadata.language}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Author */}
            <div className="glass p-6">
              <h1 className="text-4xl font-bold mb-3">{book.title}</h1>
              <p className="text-xl text-muted mb-4">by {book.authors.join(", ")}</p>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {book.genres.map((genre) => (
                  <span key={genre} className="badge">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="glass p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="leading-relaxed text-muted">{book.description}</p>
            </div>

            {/* Sections */}
            {book.sections && book.sections.length > 0 && (
              <div className="glass p-6">
                <h2 className="text-2xl font-bold mb-4">Sections</h2>
                <div className="space-y-4">
                  {book.sections.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 rounded-lg border border-white/20 hover:border-primary transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{section.title}</h3>
                        <button
                          onClick={() => setSelectedSection(section)}
                          className="px-3 py-1 text-sm rounded-lg"
                          style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "var(--color-primary)" }}
                        >
                          💾 Save
                        </button>
                      </div>
                      <p className="text-sm text-muted">{section.textSnippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Like Section Modal */}
      {selectedSection && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Save Section</h3>

            <div className="mb-4">
              <p className="text-sm text-muted mb-2">Section:</p>
              <p className="font-medium">{selectedSection.title}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={likeTags}
                onChange={(e) => setLikeTags(e.target.value)}
                placeholder="e.g., inspiring, memorable, favorite"
                className="w-full px-4 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-white/30 focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Note (optional)</label>
              <textarea
                value={likeNote}
                onChange={(e) => setLikeNote(e.target.value)}
                placeholder="Add your thoughts..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/80 dark:bg-white/10 border border-white/30 focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleLikeSection(selectedSection)} className="flex-1 btn-primary">
                Save Section
              </button>
              <button
                onClick={() => {
                  setSelectedSection(null)
                  setLikeNote("")
                  setLikeTags("")
                }}
                className="px-6 py-3 rounded-lg bg-white/70 dark:bg-white/10 text-muted hover-lift"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
