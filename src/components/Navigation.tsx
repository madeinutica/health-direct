'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import {
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  MapPinIcon as MapPinIconSolid,
  UserGroupIcon as UserGroupIconSolid
} from '@heroicons/react/24/solid'

export default function Navigation() {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Chat',
      href: '/',
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatBubbleLeftRightIconSolid,
      description: 'AI Health Assistant'
    },
    {
      name: 'Directory',
      href: '/directory',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
      description: 'Find Providers'
    },
    {
      name: 'Community',
      href: '/community',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      description: 'Health Community'
    }
  ]

  return (
    <>
      {/* Mobile-First Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Logo Row - Centered on mobile, left-aligned on desktop */}
        <div className="flex items-center justify-center lg:justify-between py-3 px-4 lg:px-8 border-b border-gray-100 lg:border-0">
          <h1 className="text-xl lg:text-2xl font-bold">
            <span className="text-primary-dark">myhealth</span>
            <span className="text-primary-light">315</span>
          </h1>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = isActive ? item.iconSolid : item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-light bg-blue-50'
                      : 'text-gray-600 hover:text-primary-light hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Mobile Navigation Icons Row - Only visible on mobile */}
        <div className="px-4 lg:hidden">
          <div className="grid grid-cols-3 gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = isActive ? item.iconSolid : item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-light bg-blue-50'
                      : 'text-gray-500 hover:text-primary-light hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium text-center">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-24 lg:h-16"></div>
    </>
  )
}