'use client'

import { useState } from 'react'
import { CommunityFeed, NewPostForm } from '@/components/Community'
import { PlusIcon } from '@heroicons/react/24/outline'
import { CommunityPost, User } from '@/types'

export default function CommunityPage() {
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Mock data - in real app, fetch from Supabase
  const mockPosts: (CommunityPost & { user?: User, isLiked?: boolean })[] = [
    {
      id: '1',
      userId: '1',
      title: 'Looking for a good pediatrician in Utica area',
      content: 'Hi everyone! I just moved to Utica and I\'m looking for recommendations for a good pediatrician for my 5-year-old daughter. Any suggestions? I prefer someone who is patient with kids and has experience with anxiety.',
      category: 'question',
      tags: ['pediatrics', 'utica', 'recommendations', 'children'],
      likeCount: 12,
      replyCount: 8,
      createdAt: '2024-11-08T14:30:00Z',
      updatedAt: '2024-11-08T14:30:00Z',
      isLiked: false,
      user: {
        id: '1',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        location: 'Utica, NY',
        joinedAt: '2024-08-15T10:00:00Z',
        isVerified: true
      }
    },
    {
      id: '2',
      userId: '2',
      title: 'Great experience with Dr. Smith at CNY Cardiology',
      content: 'I wanted to share my positive experience with Dr. Smith at Central New York Cardiology. He was thorough, explained everything clearly, and made me feel comfortable throughout the consultation. The staff was also very professional and helpful. Highly recommend!',
      category: 'recommendation',
      tags: ['cardiology', 'positive-experience', 'doctor-review'],
      likeCount: 24,
      replyCount: 5,
      createdAt: '2024-11-07T09:15:00Z',
      updatedAt: '2024-11-07T09:15:00Z',
      isLiked: true,
      user: {
        id: '2',
        email: 'michael@example.com',
        firstName: 'Michael',
        lastName: 'Chen',
        location: 'Rome, NY',
        joinedAt: '2024-07-20T15:30:00Z',
        isVerified: true
      }
    },
    {
      id: '3',
      userId: '3',
      title: 'Tips for dealing with long wait times at urgent care',
      content: 'I\'ve noticed that urgent care centers can get really busy, especially on weekends. Here are some tips I\'ve learned: Call ahead to check wait times, bring entertainment for kids, consider going early morning or late evening for shorter waits. What strategies have worked for you?',
      category: 'general',
      tags: ['urgent-care', 'tips', 'wait-times'],
      likeCount: 18,
      replyCount: 12,
      createdAt: '2024-11-06T16:45:00Z',
      updatedAt: '2024-11-06T16:45:00Z',
      isLiked: false,
      user: {
        id: '3',
        email: 'jennifer@example.com',
        firstName: 'Jennifer',
        lastName: 'Martinez',
        location: 'New Hartford, NY',
        joinedAt: '2024-06-10T12:00:00Z',
        isVerified: false
      }
    }
  ]

  const categories = [
    { id: 'all', label: 'All Posts', count: mockPosts.length },
    { id: 'question', label: 'Questions', count: mockPosts.filter(p => p.category === 'question').length },
    { id: 'recommendation', label: 'Recommendations', count: mockPosts.filter(p => p.category === 'recommendation').length },
    { id: 'experience', label: 'Experiences', count: mockPosts.filter(p => p.category === 'experience').length },
    { id: 'general', label: 'General', count: mockPosts.filter(p => p.category === 'general').length }
  ]

  const sortOptions = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'replies', label: 'Most Replies' },
    { id: 'oldest', label: 'Oldest First' }
  ]

  const filteredPosts = selectedCategory === 'all' 
    ? mockPosts 
    : mockPosts.filter(post => post.category === selectedCategory)

  const handleNewPost = (postData: Omit<CommunityPost, 'id' | 'userId' | 'likeCount' | 'replyCount' | 'createdAt' | 'updatedAt'>) => {
    console.log('New post:', postData)
    setShowNewPostForm(false)
    // In real app, submit to Supabase
  }

  const handleLike = (postId: string) => {
    console.log('Like post:', postId)
    // In real app, toggle like in Supabase
  }

  const handlePostClick = (postId: string) => {
    console.log('Navigate to post:', postId)
    // In real app, navigate to post detail page
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-6 text-center mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Community
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Connect and share healthcare experiences
          </p>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 mx-auto max-w-7xl">
        <div className="space-y-6">
          {/* Categories - Mobile Horizontal Scroll */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 bg-gray-50'
                  }`}
                >
                  <span>{category.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* New Post Form or Post List */}
          {showNewPostForm ? (
            <div className="bg-white rounded-lg border border-gray-200">
              <NewPostForm 
                onSubmit={handleNewPost}
                onCancel={() => setShowNewPostForm(false)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sort Options */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedCategory === 'all' ? 'All Posts' : categories.find(c => c.id === selectedCategory)?.label}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {filteredPosts.length} posts
                    </p>
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Posts */}
              <CommunityFeed
                posts={filteredPosts}
                onLike={handleLike}
                onPostClick={handlePostClick}
              />

              {/* Load More */}
              {filteredPosts.length > 0 && (
                <div className="text-center">
                  <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Load More Posts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}