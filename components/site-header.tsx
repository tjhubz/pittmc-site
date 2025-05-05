"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import styles from "@/app/hero-animations.module.css"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.1] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/pittmc-logo.png"
            alt="PittMC Logo"
            width={120}
            height={48}
            className="h-8 w-auto"
          />
          <span className="ml-2 hidden text-lg font-semibold sm:inline-block">PittMC</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center gap-6">
          <Link href="/#about" className="text-sm font-medium transition-colors hover:text-[#003594]">
            About
          </Link>
          <Link href="/map" className="text-sm font-medium transition-colors hover:text-[#003594]">
            Map
          </Link>
          <a
            href="https://discord.com/invite/MNcFhkjJcW"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium transition-colors hover:text-[#003594]"
          >
            Discord
          </a>
          <Button 
            asChild 
            size="sm" 
            className={`bg-[#003594] hover:bg-[#003594]/90 ${styles.cta}`}
          >
            <Link href="/whitelist-wizard">Get Whitelisted</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="ml-auto md:hidden p-2 z-50 relative"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <AnimatePresence initial={false} mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Navigation Dropdown with Animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay - positioned below the header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 inset-x-0 bottom-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown menu container */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="absolute top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg md:hidden overflow-hidden"
            >
              {/* Menu content with delayed appearance */}
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: 0.15, // Delay appearance until container expands
                }}
                className="container py-4 flex flex-col gap-4"
              >
                <Link
                  href="/#about"
                  className="px-2 py-3 text-base font-medium transition-colors hover:text-[#003594] hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/map"
                  className="px-2 py-3 text-base font-medium transition-colors hover:text-[#003594] hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Map
                </Link>
                <a
                  href="https://discord.com/invite/MNcFhkjJcW"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-3 text-base font-medium transition-colors hover:text-[#003594] hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Discord
                </a>
                <div className="px-2 pt-2">
                  <Button
                    asChild
                    className={`w-full bg-[#003594] hover:bg-[#003594]/90 ${styles.cta}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/whitelist-wizard">Get Whitelisted</Link>
                  </Button>
                </div>
              </motion.nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
