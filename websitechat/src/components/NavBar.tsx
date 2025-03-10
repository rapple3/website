"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center bg-gray-50">
      <nav className="backdrop-blur-md bg-black/20 rounded-full px-6 py-3 flex items-center justify-center shadow-lg dark:bg-white/20">
        <div className="flex items-center space-x-8">
          <NavLink href="/" active={pathname === "/"}>Home</NavLink>
          <NavLink href="/about" active={pathname === "/about"}>About</NavLink>
          <NavLink href="/work" active={pathname === "/work"}>Work</NavLink>
          <NavLink href="/blog" active={pathname === "/blog"}>Blog</NavLink>
          <NavLink href="/gallery" active={pathname === "/gallery"}>Gallery</NavLink>
        </div>
      </nav>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className={`flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${
        active 
          ? 'bg-white/20' 
          : 'hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
} 