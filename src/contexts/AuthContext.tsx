import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider } from '@/lib/firebase'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth'

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

  useEffect(() => {
    // Only set up auth listener if Firebase is properly initialized
    if (!auth) {
      console.warn('Firebase auth not initialized. Running in guest mode only.');
      setLoading(false);
      return;
    }

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      // If user logs in, disable guest mode
      if (user) {
        setIsGuestMode(false)
        localStorage.setItem('guestMode', 'false')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase not properly configured. Please check your environment variables.');
    }
    
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase not properly configured. Please check your environment variables.');
    }
    
    try {
      await firebaseSignOut(auth)
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
