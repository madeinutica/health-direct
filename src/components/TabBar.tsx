'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, UserIcon } from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid'

export default function TabBar() {
  const pathname = usePathname()

  const tabs = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      isActive: pathname === '/'
    },
    {
      name: 'Search',
      href: '/directory',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
      isActive: pathname?.startsWith('/directory')
    },
    {
      name: 'Assistant',
      href: '/assistant',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatBubbleLeftRightIconSolid,
      isActive: pathname?.startsWith('/assistant')
    },
    {
      name: 'Community',
      href: '/community',
      icon: UserIcon,
      activeIcon: UserIconSolid,
      isActive: pathname?.startsWith('/community')
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <nav className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.isActive ? tab.activeIcon : tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 transition-colors ${
                tab.isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
