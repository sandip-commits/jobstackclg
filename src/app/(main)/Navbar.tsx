"use client";

import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("nav--active");
    } else {
      document.body.classList.remove("nav--active");
    }
    return () => {
      document.body.classList.remove("nav--active");
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="dark:bg-main-gradient absolute left-0 top-0 z-50 w-full py-4 shadow-sm">
      <div className="container flex items-center justify-between gap-3 py-16">
        <Link
          href="/home"
          className="flex items-center gap-2"
          onClick={closeMenu}
        >
          <Image
            src={logo}
            alt="Logo"
            width={250}
            height={100}
            className="h-48 w-auto rounded-full"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="menu flex items-center gap-x-[30px]">
            <li className="menu__item">
              <Link
                href="/resumes"
                className="menu__link hover:text-gray-300 text-base font-medium transition-colors"
                aria-label="Resume builder"
              >
                Resume Builder
              </Link>
            </li>
            <li className="menu__item">
              <Link
                href="/analyzer"
                className="menu__link hover:text-gray-300 text-base font-medium transition-colors"
                aria-label="Resume analyzer"
              >
                Resume Analyzer
              </Link>
            </li>
            <li className="menu__item">
              <Link
                href="/recommender"
                className="menu__link hover:text-gray-300 text-base font-medium transition-colors"
                aria-label="Job recommender"
              >
                Job Recommender
              </Link>
            </li>
          </ul>
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-6 lg:flex">
          <ThemeToggle />
          <UserMenu />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle navigation"
            type="button"
            onClick={toggleMenu}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 flex h-32 w-32 items-center justify-center rounded-md p-2 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-24 w-24" />
            ) : (
              <Menu className="h-24 w-24" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-[72px] z-40 bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Navigation Menu */}
      <nav
        className={`fixed left-0 top-[72px] z-40 w-full bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-slate-900 lg:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col border-t">
          <Link
            href="/resumes"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b px-6 py-4 text-base font-medium transition-colors"
            onClick={closeMenu}
          >
            Resume Builder
          </Link>
          <Link
            href="/analyzer"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b px-6 py-4 text-base font-medium transition-colors"
            onClick={closeMenu}
          >
            Resume Analyzer
          </Link>
          <Link
            href="/recommender"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b px-6 py-4 text-base font-medium transition-colors"
            onClick={closeMenu}
          >
            Job Recommender
          </Link>
          <div className="flex items-center justify-center gap-4 border-b px-6 py-4">
            <UserMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}
