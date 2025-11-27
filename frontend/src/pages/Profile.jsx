import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { User, Mail, Phone, MapPin, Edit2, Save, X, ShoppingBag, Heart, LogOut } from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebaseClient'
import toast from 'react-hot-toast'

export default function Profile() {
  const navigate = useNavigate()
  const { user, loading, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setProfileData({
              displayName: data.displayName || user.displayName || '',
              email: user.email || '',
              phone: data.phone || '',
              address: data.address || '',
              city: data.city || '',
              pincode: data.pincode || ''
            })
          } else {
            // Initialize with Firebase auth data
            setProfileData({
              displayName: user.displayName || '',
              email: user.email || '',
              phone: '',
              address: '',
              city: '',
              pincode: ''
            })
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      }
    }
    fetchProfile()
  }, [user])

  const handleChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: new Date(),
        email: user.email // Always use auth email
      }, { merge: true })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavBar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-32"></div>
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-600">
                        {(profileData.displayName || user.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {profileData.displayName || 'Customer'}
                  </h1>
                  <p className="text-slate-600">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline btn-sm flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn btn-ghost btn-sm flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary btn-sm flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Details */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleChange}
                      className="input"
                      placeholder="Your name"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{profileData.displayName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <p className="text-slate-900 py-2">{user.email}</p>
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="+91 9876543210"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{profileData.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Delivery Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      className="input min-h-[80px]"
                      placeholder="Your delivery address"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{profileData.address || 'Not set'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleChange}
                        className="input"
                        placeholder="City"
                      />
                    ) : (
                      <p className="text-slate-900 py-2">{profileData.city || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Pincode
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pincode"
                        value={profileData.pincode}
                        onChange={handleChange}
                        className="input"
                        placeholder="Pincode"
                      />
                    ) : (
                      <p className="text-slate-900 py-2">{profileData.pincode || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                    <span>Browse Products</span>
                  </button>
                  <button
                    onClick={() => toast('Coming soon!')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>My Wishlist</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Order via WhatsApp */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Need Help?</h3>
                <p className="text-sm text-green-700 mb-4">
                  Contact us on WhatsApp for custom orders or any queries.
                </p>
                <a
                  href="https://wa.me/916372362313?text=Hi!%20I%20need%20help%20with%20my%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-green-600 hover:bg-green-700 text-white w-full"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
