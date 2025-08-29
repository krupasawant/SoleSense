'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 border-r p-6 flex flex-col justify-between">
      <div>
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">📊 Dashboard</Button>
          </Link>
          <Link href="/dashboard/products">
            <Button variant="ghost" className="w-full justify-start">👟 Products</Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="ghost" className="w-full justify-start">📦 Orders</Button>
          </Link>
        </nav>
      </div>

      <div>
        <Separator className="my-4" />
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start text-gray-500">← Back to Home</Button>
        </Link>
      </div>
    </aside>
  )
}
