'use client'

import { useEffect } from 'react'

// This component runs on every page and ensures 
// the cookie stays in sync with localStorage
export function AuthCookieSync() {
  useEffect(() => {
    const token = localStorage.getItem('xavier_access_token')
    
    if (token) {
      // Refresh cookie on every page load
      document.cookie = [
        `xavier_access_token=${token}`,
        'path=/',
        'max-age=86400',
        'SameSite=Lax',
        'Secure',
      ].join('; ')
    }
  }, [])

  return null
}
