"use client"

import type { Book, Recommendation } from "@/types"
import { useRouter } from "next/navigation"
import { Star, Heart } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

interface BookCardProps {
  book: Book
  recommendation?: Recommendation
  rank?: number
}

export default function BookCard({ book, recommendation, rank }: BookCardProps) {
  const router = useRouter()
  const { user, toggleFavorite } = useAuthStore()
  const isFavorite = book._id && user?.favorites?.includes(book._id)

  const handleClick = () => {
    router.push(`/book/${book._id}`)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (book._id) {
      toggleFavorite(book._id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="relative glass hover-lift cursor-pointer overflow-hidden group"
      role="button"
      aria-label={`Open ${book.title}`}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} 
        />
      </button>

      {/* Rank Badge */}
      {rank && (
        <div
          className="absolute top-4 left-4 w-10 h-10 text-white rounded-full flex items-center justify-center font-bold z-10 shadow-sm"
          style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
        >
          #{rank}
        </div>
      )}

      {/* Book Cover */}
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
        {book.metadata?.coverImage ? (
          <>
            <img
              src={book.metadata.coverImage}
              alt={`${book.title} cover`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                // Fallback to placeholder on image error
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          // Fallback placeholder
          <div className="h-full flex items-center justify-center text-white">
            <div
              className="absolute inset-0 opacity-20 bg-[radial-gradient(1000px_200px_at_0%_0%,white,transparent)]"
              aria-hidden
            />
            <div className="text-center px-4 relative z-10">
              <div className="text-4xl mb-2" aria-hidden>
                📚
              </div>
              <p className="text-sm font-medium line-clamp-2">{book.title}</p>
            </div>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted mb-3">by {book.authors.join(", ")}</p>

        {/* Genres */}
        {book.genres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {book.genres.slice(0, 5).map((genre) => (
              <span key={genre} className="badge">
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted line-clamp-3 mb-3">{book.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent fill-current" />
            <span className="font-medium">{book.popularity?.ratings?.average?.toFixed(1) || 'N/A'}</span>
            <span className="text-muted">({book.popularity?.ratings?.count || 0})</span>
          </div>
          <div className="text-muted">{book.popularity?.reads || 0} reads</div>
        </div>

        {/* Recommendation Explanation */}
        {recommendation && (
          <div className="pt-3 border-t border-white/20">
            <p
              className="text-sm px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(79, 70, 229, 0.08)", color: "var(--color-primary)" }}
            >
              💡 {recommendation.why}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted">Source: {recommendation.source}</span>
              <span className="font-medium text-primary">Match: {(recommendation.score * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Pages Info */}
        {book.metadata?.pages && <div className="mt-3 text-xs text-muted">📖 {book.metadata.pages} pages</div>}
      </div>
    </div>
  )
}
