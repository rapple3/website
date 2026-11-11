"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-gray-50/80 backdrop-blur-md border-b border-gray-200/70">
      <nav className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between md:justify-center">
        <Link href="/" className="font-semibold text-gray-900 md:hidden">
          Russell Apple
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-sm ring-1 ring-gray-200">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} active={pathname === l.href}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-gray-800 hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>
    </header>

      {/* Mobile menu: tap outside to close. Kept outside <header> because its
          backdrop blur would otherwise trap this fixed overlay inside the header. */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="relative mx-4 mt-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-gray-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} active={pathname === l.href} mobile>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  href,
  active,
  mobile,
  children,
}: {
  href: string;
  active: boolean;
  mobile?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`transition-colors font-medium ${
        mobile ? "px-4 py-3 rounded-xl text-base" : "px-4 py-1.5 rounded-full text-sm"
      } ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}
