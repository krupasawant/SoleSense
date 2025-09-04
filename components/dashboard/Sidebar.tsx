'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChartBarIcon, CubeIcon, DocumentTextIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-20 left-4 z-50">
        <Button
          variant="ghost"
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2"
        >
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          <span>Menu</span>
        </Button>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gray-100 border-r p-6 flex flex-col justify-between
          transform transition-transform duration-200 ease-in-out
          w-48 z-50
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:translate-x-0 md:h-screen md:z-auto
        `}
      >
        <div>
          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <ChartBarIcon className="w-5 h-5 text-black" />
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
                <DocumentTextIcon className="w-5 h-5 text-black" />
                <span>Orders</span>
              </Button>
            </Link>
          </nav>
        </div>

        <div>
          <Separator className="my-4" />
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-gray-500">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </aside>
    </>
  )
}
