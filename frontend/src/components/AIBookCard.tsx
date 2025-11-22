"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Recommendation } from "@/types"
import { ExternalLink, Star, BookOpen, Heart, MessageCircle } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import BookChatModal from "./BookChatModal"

interface AIBookCardProps {
  recommendation: Recommendation
  rank: number
}

export default function AIBookCard({ recommendation, rank }: AIBookCardProps) {
  const router = useRouter()
  const { user, toggleFavorite } = useAuthStore()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const {
    title,
    authors,
    description,
    coverImage,
    genres,
    pageCount,
    averageRating,
    ratingsCount,
    previewLink,
    infoLink,
    why,
    score
  } = recommendation;

  const bookId = typeof recommendation.book === 'object' ? recommendation.book?._id : undefined;
  const isFavorite = bookId && user?.favorites?.includes(bookId);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (bookId) {
      toggleFavorite(bookId)
    } else {
      toggleFavorite(undefined, {
        googleBooksId: recommendation.googleBooksId,
        title: recommendation.title,
        authors: recommendation.authors,
        description: recommendation.description,
        coverImage: recommendation.coverImage,
        genres: recommendation.genres,
        pageCount: recommendation.pageCount,
        publishDate: recommendation.publishDate,
        averageRating: recommendation.averageRating,
        ratingsCount: recommendation.ratingsCount
      })
    }
  }

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsChatOpen(true)
  }

  const handleCardClick = () => {
    if (recommendation.googleBooksId) {
      router.push(`/book-external/${recommendation.googleBooksId}`)
    }
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative glass hover-lift overflow-hidden group cursor-pointer border border-gray-200"
        role="button"
        aria-label={`View details for ${title}`}
      >
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={handleChat}
            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110"
            aria-label="Chat with book"
            title="Chat with this book"
          >
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </button>

          <button
            onClick={handleFavorite}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all hover:scale-110"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} 
            />
          </button>
        </div>

      {/* Book Cover */}
      <div className="h-40 relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={`${title} cover`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-white">
            <div className="text-center px-4 relative z-10">
              <div className="text-4xl mb-2" aria-hidden>
                📚
              </div>
              <p className="text-sm font-medium line-clamp-2">{title}</p>
            </div>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted mb-2">by {authors?.join(", ")}</p>

        {/* Genres */}
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {genres.slice(0, 5).map((genre, index) => (
              <span key={index} className="badge">
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-muted line-clamp-2 mb-2">{description}</p>

        {/* Rating & Pages */}
        <div className="flex items-center gap-3 mb-2 text-xs">
          {averageRating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent fill-current" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              {ratingsCount && <span className="text-muted">({ratingsCount.toLocaleString()})</span>}
            </div>
          )}
          {pageCount && (
            <div className="flex items-center gap-1 text-muted">
              <BookOpen className="w-4 h-4" />
              <span>{pageCount} pages</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {previewLink && (
            <a
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              Preview
            </a>
          )}
          {infoLink && (
            <a
              href={infoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              View Details
            </a>
          )}
        </div>
      </div>
    </div>

    <BookChatModal
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
      bookTitle={title || "Unknown Book"}
      authors={authors || []}
    />
    </>
  );
}
