import { useState, useEffect, useContext, createContext } from 'react'
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true)
      if (currentUser) {
        setUser(currentUser)
        const userDocRef = doc(db, 'users', currentUser.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const role = userData.role || 'customer'
          setIsAdmin(role === 'admin' || role === 'super_admin')
          setIsSuperAdmin(role === 'super_admin')
        } else {
          setIsAdmin(false)
          setIsSuperAdmin(false)
        }
      } else {
        setUser(null)
        setIsAdmin(false)
        setIsSuperAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = (email, password) => {
    setLoading(true)
    return signInWithEmailAndPassword(auth, email, password).finally(() => setLoading(false))
  }

  const signup = (email, password) => {
    setLoading(true)
    return createUserWithEmailAndPassword(auth, email, password).finally(() => setLoading(false))
  }

  const logout = () => {
    return signOut(auth)
  }

  const value = {
    user,
    isAdmin,
    isSuperAdmin,
    loading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
