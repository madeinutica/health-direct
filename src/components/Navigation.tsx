'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default function Navigation() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/directory', label: 'Directory' },
    { href: '/community', label: 'Community' },
    { href: '/reviews', label: 'Reviews' },
  ]
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              HealthDirect
            </Link>
          </div>
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  pathname === item.href
                    ? 'text-primary-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Chat</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}