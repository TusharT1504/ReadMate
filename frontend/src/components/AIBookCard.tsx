"use client"

import type { Recommendation } from "@/types"
import { ExternalLink, Star, BookOpen } from "lucide-react"

interface AIBookCardProps {
  recommendation: Recommendation
  rank: number
}

export default function AIBookCard({ recommendation, rank }: AIBookCardProps) {
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

  return (
    <div
      className="relative glass hover-lift overflow-hidden group"
      role="article"
      aria-label={`Recommendation: ${title}`}
    >
      {/* Rank Badge */}
      <div
        className="absolute top-4 left-4 w-10 h-10 text-white rounded-full flex items-center justify-center font-bold z-10 shadow-sm"
        style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
      >
        #{rank}
      </div>

      {/* AI Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
          <span>✨</span>
          <span>AI Recommended</span>
        </div>
      </div>

      {/* Book Cover */}
      <div className="h-48 relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
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
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted mb-3">by {authors?.join(", ")}</p>

        {/* Genres */}
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {genres.slice(0, 3).map((genre, index) => (
              <span key={index} className="badge">
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted line-clamp-3 mb-3">{description}</p>

        {/* Rating & Pages */}
        <div className="flex items-center gap-4 mb-3 text-sm">
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

        {/* AI Explanation */}
        <div className="pt-3 border-t border-white/20 mb-3">
          <p
            className="text-sm px-3 py-2 rounded-lg"
            style={{ backgroundColor: "rgba(139, 92, 246, 0.08)", color: "var(--color-primary)" }}
          >
            💡 {why}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted">AI Match</span>
            <span className="font-medium text-primary">{(score * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {previewLink && (
            <a
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
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
              className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Details
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
