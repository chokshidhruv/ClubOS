"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

type NavItem = { label: string; href: string }

export default function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm px-3 py-2 rounded transition ${
            pathname.startsWith(item.href)
              ? "bg-gray-200 font-medium text-black"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </>
  )
}
