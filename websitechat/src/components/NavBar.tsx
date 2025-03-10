"use client";

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] bg-gray-50/90 backdrop-blur-md px-4 py-4 shadow-sm border-b border-gray-200/50">
      <nav className="max-w-7xl mx-auto relative flex items-center justify-center md:justify-center h-12">
        {/* Mobile menu button */}
        <div className="md:hidden absolute right-3 top-2 z-[101]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-all duration-200 active:scale-95 active:bg-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex justify-center">
          <div className="backdrop-blur-md bg-black/20 rounded-full px-8 py-3 flex items-center justify-center shadow-lg dark:bg-white/20">
            <div className="flex items-center space-x-8">
              <NavLink href="/" active={pathname === "/"}>Home</NavLink>
              <NavLink href="/about" active={pathname === "/about"}>About</NavLink>
              <NavLink href="/work" active={pathname === "/work"}>Work</NavLink>
              <NavLink href="/blog" active={pathname === "/blog"}>Blog</NavLink>
              <NavLink href="/gallery" active={pathname === "/gallery"}>Gallery</NavLink>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden fixed top-[72px] inset-0 pointer-events-nonez-[99]`}
          style={{ maxHeight: 'calc(100vh - 72px)' }}
        >
          {/* This is the gray menu container - no extra white box around it */}
          <div className="pointer-events-auto absolute top-0 right-0 w-64 max-h-[calc(100vh-72px)] overflow-y-auto">
            <div className="bg-gray-50/95 backdrop-blur-lg rounded-l-lg shadow-lg flex flex-col items-center justify-start py-4 w-full">
              <div className="backdrop-blur-md bg-black/20 rounded-xl px-6 py-4 flex flex-col items-center space-y-5 shadow-lg dark:bg-white/20 w-5/6 mx-auto">
                <NavLink href="/" active={pathname === "/"} onClick={() => setIsOpen(false)}>Home</NavLink>
                <NavLink href="/about" active={pathname === "/about"} onClick={() => setIsOpen(false)}>About</NavLink>
                <NavLink href="/work" active={pathname === "/work"} onClick={() => setIsOpen(false)}>Work</NavLink>
                <NavLink href="/blog" active={pathname === "/blog"} onClick={() => setIsOpen(false)}>Blog</NavLink>
                <NavLink href="/gallery" active={pathname === "/gallery"} onClick={() => setIsOpen(false)}>Gallery</NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavLink({ 
  href, 
  active, 
  children,
  onClick
}: { 
  href: string; 
  active: boolean; 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center justify-center px-6 py-3 rounded-full text-base font-medium transition-all duration-200
        ${active 
          ? 'bg-white/20 text-white scale-[1.02]' 
          : 'text-white hover:bg-white/10 hover:scale-[1.02]'
        }
        md:px-4 md:py-2 md:text-sm ${
        active ? 'font-semibold' : ''
      }`}
    >
      {children}
    </Link>
  );
} 