'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChartBarIcon,CubeIcon ,DocumentTextIcon  } from "@heroicons/react/24/outline";

export function Sidebar() {
  return (
    <aside className="w-48 h-screen sticky top-0 bg-gray-100 border-r p-6 flex flex-col justify-between">
      <div>
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
               <ChartBarIcon  className="w-5 h-5 text-black" />
               <span>Dashboard</span>
              </Button>
          </Link>
          <Link href="/dashboard/products">
            <Button variant="ghost" className="w-full justify-start">
              <CubeIcon className="w-5 h-5 text-black" />
              <span>Products</span>
              </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="ghost" className="w-full justify-start">
              <DocumentTextIcon  className="w-5 h-5 text-black" />
               <span>Orders</span>

            </Button>
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
