"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface AppbarProps {
    isBlogPage?: boolean;
}

export function Appbar({ isBlogPage = false }: AppbarProps) { 
    const { data: session } = useSession();
    const pathname = usePathname();

    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/all-blogs", label: "All Blogs" },
    ];

    const userLinks = session?.user
        ? [
              { href: "/write-blog", label: "Write a Blog" },
              { href: "/my-blogs", label: "My Blogs" },
              { href: "/bookmarks", label: "Bookmarks" },
          ]
        : [];

    return (
        <header className={`bg-white shadow-sm border-b border-gray-200 ${isBlogPage ? "bg-gray-100" : ""}`}>
            <div className="max-w mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                    LipiVerse
                </Link>

                <button
                    className="sm:hidden block text-gray-800 hover:text-gray-600 focus:outline-none"
                    onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>

                <nav className="hidden sm:flex items-center space-x-6">
                    {navLinks.map(({ href, label }) => (
                        <Link key={href} href={href} className={`text-gray-600 hover:text-gray-900 ${pathname === href ? "font-bold text-gray-800" : ""}`}>
                            {label}
                        </Link>
                    ))}
                    {userLinks.map(({ href, label }) => (
                        <Link key={href} href={href} className={`text-gray-600 hover:text-gray-900 ${pathname === href ? "font-bold text-gray-800" : ""}`}>
                            {label}
                        </Link>
                    ))}
                    <Link href="/contact" className={`text-gray-600 hover:text-gray-900 ${pathname === "/contact" ? "font-bold text-gray-800" : ""}`}>
                        Contact
                    </Link>
                    {session?.user ? (
                        <Button onClick={() => signOut()}>Logout</Button>
                    ) : (
                        <Button onClick={() => signIn()}>Sign In</Button>
                    )}
                </nav>
            </div>

            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white shadow-md py-4 border-t border-gray-200">
                    <div className="flex flex-col items-center space-y-4">
                        {navLinks.map(({ href, label }) => (
                            <Link key={href} href={href} className={`text-gray-600 hover:text-gray-900 ${pathname === href ? "font-bold text-gray-800" : ""}`}>
                                {label}
                            </Link>
                        ))}
                        {userLinks.map(({ href, label }) => (
                            <Link key={href} href={href} className={`text-gray-600 hover:text-gray-900 ${pathname === href ? "font-bold text-gray-800" : ""}`}>
                                {label}
                            </Link>
                        ))}
                        <Link href="/contact" className={`text-gray-600 hover:text-gray-900 ${pathname === "/contact" ? "font-bold text-gray-800" : ""}`}>
                            Contact
                        </Link>
                        {session?.user ? (
                            <Button onClick={() => signOut()}>Logout</Button>
                        ) : (
                            <Button onClick={() => signIn()}>Sign In</Button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
