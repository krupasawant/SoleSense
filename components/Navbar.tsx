'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

import { User } from '@supabase/supabase-js'

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | any>(null)

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
    <nav className="sticky top-0 z-10 w-full h-20 py-4 flex justify-between items-center border-b bg-white shadow-sm">
      <Link href="/" className="flex items-center gap-2">
  <Image
    src="/logo.png"
    alt="SoleSense logo"
    width={200}
    height={80}
    className="rounded-full"
  />
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
          <>
          <Link href="/login"><Button className="bg-pink-600  text-white">Login</Button></Link>
          <Link href="/signup"><Button variant="ghost" className='text-pink-600' >Sign Up</Button></Link>
          
          </>
        )}
      </div>
    </nav>
  )
}
