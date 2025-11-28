"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Shield } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm border-b border-emerald-200">
      <Link href="/">
        <Button variant={pathname === "/" ? "default" : "ghost"} size="sm">
          <Home className="h-4 w-4 mr-2" />
          Portal
        </Button>
      </Link>
      <Link href="/admin">
        <Button variant={pathname === "/admin" ? "default" : "ghost"} size="sm">
          <Shield className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </Link>
    </nav>
  )
}
