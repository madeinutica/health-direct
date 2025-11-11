'use client'

import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Review } from '@/types'

interface ReviewFormProps {
  providerId: string
  onSubmit?: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose?: () => void
}

export function ReviewForm({ providerId, onSubmit, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [visitDate, setVisitDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating || !title.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      const review = {
        providerId,
        userId: 'temp-user-id', // In real app, get from auth context
        rating,
        title: title.trim(),
        content: content.trim(),
        isAnonymous,
        isVerified: false,
        visitDate: visitDate || undefined
      }
      
      onSubmit?.(review)
      
      // Reset form
      setRating(0)
      setTitle('')
      setContent('')
      setIsAnonymous(false)
      setVisitDate('')
      
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= (hoverRating || rating) ? (
                      <StarSolidIcon className="h-8 w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-8 w-8 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                maxLength={100}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share details about your experience..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                maxLength={1000}
              />
              <div className="text-sm text-gray-500 mt-1">
                {content.length}/1000 characters
              </div>
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Date (Optional)
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Post anonymously
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !rating || !title.trim() || !content.trim()}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

interface ReviewCardProps {
  review: Review & { user?: { firstName?: string; lastName?: string; isVerified?: boolean } }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatVisitDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {review.isAnonymous ? (
              <span className="text-primary-600 font-medium">A</span>
            ) : (
              <span className="text-primary-600 font-medium">
                {review.user?.firstName?.[0] || 'U'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {review.isAnonymous 
                  ? 'Anonymous' 
                  : `${review.user?.firstName || 'User'} ${review.user?.lastName?.[0] || ''}.`
                }
              </span>
              {review.isVerified && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Verified Patient
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatDate(review.createdAt)}</span>
              {review.visitDate && (
                <>
                  <span>•</span>
                  <span>Visited {formatVisitDate(review.visitDate)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Rating Stars */}
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarSolidIcon
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Content */}
      <div>
        <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
        <p className="text-gray-700 leading-relaxed">{review.content}</p>
      </div>
    </div>
  )
}

interface ReviewsListProps {
  reviews: (Review & { user?: { firstName?: string; lastName?: string; isVerified?: boolean } })[]
  loading?: boolean
}

export function ReviewsList({ reviews, loading }: ReviewsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <StarIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-600">Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}