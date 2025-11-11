'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  UserCircleIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { CommunityPost, PostReply, User } from '@/types'

interface PostCardProps {
  post: CommunityPost & { 
    user?: User,
    isLiked?: boolean,
    replies?: PostReply[]
  }
  onLike?: (postId: string) => void
  onReply?: (postId: string) => void
  onClick?: () => void
}

export function PostCard({ post, onLike, onReply, onClick }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question':
        return 'bg-blue-100 text-blue-700'
      case 'recommendation':
        return 'bg-green-100 text-green-700'
      case 'experience':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {post.user?.avatarUrl ? (
              <Image 
                src={post.user.avatarUrl} 
                alt={post.user.firstName || 'User'} 
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-6 w-6 text-primary-600" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {post.user?.firstName} {post.user?.lastName}
              </span>
              {post.user?.isVerified && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatDate(post.createdAt)}</span>
              {post.user?.location && (
                <>
                  <span>•</span>
                  <span>{post.user.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(post.category)}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 leading-relaxed line-clamp-3">{post.content}</p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLike?.(post.id)
            }}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            {post.isLiked ? (
              <HeartSolidIcon className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
            <span className="text-sm">{post.likeCount}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReply?.(post.id)
            }}
            className="flex items-center space-x-2 text-gray-500 hover:text-primary-500 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" />
            <span className="text-sm">{post.replyCount}</span>
          </button>
        </div>
        
        <span className="text-xs text-gray-400">
          Click to read more
        </span>
      </div>
    </div>
  )
}

interface NewPostFormProps {
  onSubmit?: (post: Omit<CommunityPost, 'id' | 'userId' | 'likeCount' | 'replyCount' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
}

export function NewPostForm({ onSubmit, onCancel }: NewPostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<CommunityPost['category']>('general')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { id: 'question', label: 'Question', description: 'Ask for advice or information' },
    { id: 'recommendation', label: 'Recommendation', description: 'Share positive experiences' },
    { id: 'experience', label: 'Experience', description: 'Share your healthcare journey' },
    { id: 'general', label: 'General', description: 'General discussion' }
  ]

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase()) && tags.length < 5) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      const post = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : undefined
      }
      
      onSubmit?.(post)
      
      // Reset form
      setTitle('')
      setContent('')
      setCategory('general')
      setTags([])
      setNewTag('')
      
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Close</span>
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  category === cat.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCategory(cat.id as CommunityPost['category'])}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id as CommunityPost['category'])}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{cat.label}</div>
                    <div className="text-sm text-gray-500">{cat.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title for your post"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={200}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, questions, or experiences..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={2000}
          />
          <div className="text-sm text-gray-500 mt-1">
            {content.length}/2000 characters
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full flex items-center space-x-1"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-primary-500 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={30}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newTag.trim() || tags.length >= 5}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Add up to 5 tags to help others find your post
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

interface CommunityFeedProps {
  posts: (CommunityPost & { 
    user?: User,
    isLiked?: boolean 
  })[]
  loading?: boolean
  onLike?: (postId: string) => void
  onPostClick?: (postId: string) => void
}

export function CommunityFeed({ posts, loading, onLike, onPostClick }: CommunityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-4">
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChatBubbleLeftIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-600">Be the first to start a conversation!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onClick={() => onPostClick?.(post.id)}
        />
      ))}
    </div>
  )
}