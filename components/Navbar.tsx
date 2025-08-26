'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center border-b bg-white shadow-sm">
      <Link href="/" className="text-xl font-semibold text-gray-800">
        SoleSense
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">Hi, {user.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
