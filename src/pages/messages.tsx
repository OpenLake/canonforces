import React from 'react'
import NavigationMenu from '../common/components/NavigationMenu/NavigationMenu'

const Message = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <NavigationMenu />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl px-8 py-10 flex flex-col items-center">
          <span className="text-5xl mb-4">🚧</span>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Feature Upcoming!</h2>
          <p className="text-gray-600 mb-1">The messaging feature is under construction.</p>
          <p className="text-gray-500 text-sm">Stay tuned for updates!</p>
        </div>
      </main>
    </div>
  )
}

export default Message
