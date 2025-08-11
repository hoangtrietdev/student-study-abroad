import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isGuestMode: boolean
  enableGuestMode: () => void
  disableGuestMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuestMode, setIsGuestMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Default to true (guest mode) unless explicitly disabled
      const guestModeStored = localStorage.getItem('guestMode')
      return guestModeStored !== 'false'
    }
    return true // Default to guest mode on server
  })

  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      // If user is logged in, disable guest mode
      if (session?.user) {
        setIsGuestMode(false)
        localStorage.setItem('guestMode', 'false')
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      // If user logs in, disable guest mode
      if (session?.user) {
        setIsGuestMode(false)
        localStorage.setItem('guestMode', 'false')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // After sign out, return to guest mode by default
      enableGuestMode()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const enableGuestMode = () => {
    setIsGuestMode(true)
    localStorage.setItem('guestMode', 'true')
  }

  const disableGuestMode = () => {
    setIsGuestMode(false)
    localStorage.setItem('guestMode', 'false')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
        isGuestMode,
        enableGuestMode,
        disableGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
