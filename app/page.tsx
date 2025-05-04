"use client"

import Link from "next/link"
import { ArrowRight, Users, Server, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center overflow-hidden bg-[#003594] min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('/pittmc-hero.png')] bg-cover bg-center"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Pitt's Minecraft Server
            </h1>

            <p className="mb-8 text-lg text-white/80 md:text-xl">
              A welcoming community for Pitt affiliates to build, explore, and collaborate.
            </p>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-[#FFB81C] text-[#003594] hover:bg-[#FFB81C]/90 font-semibold">
                <Link href="/whitelist-wizard">
                  Get Whitelisted <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-[#003594] md:text-4xl">
            About Our Server
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
              <div className="mb-4 rounded-full bg-[#003594]/10 p-3">
                <Users className="h-8 w-8 text-[#003594]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#003594]">Community</h3>
              <p className="text-gray-600">
                Connect with fellow Pitt students in a creative virtual environment where you can build, explore, and
                collaborate.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
              <div className="mb-4 rounded-full bg-[#003594]/10 p-3">
                <Server className="h-8 w-8 text-[#003594]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#003594]">Cross-Platform</h3>
              <p className="text-gray-600">
                Play on either Java or Bedrock Edition. Our server supports both platforms so you can join from your
                preferred device and play with your friends.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-lg border border-gray-200 p-6 text-center shadow-sm">
              <div className="mb-4 rounded-full bg-[#003594]/10 p-3">
                <MessageSquare className="h-8 w-8 text-[#003594]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#003594]">Discord Integration</h3>
              <p className="text-gray-600">
                Join our Discord server to stay connected, get server updates, and chat with other players even when
                you're not in-game.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-[#003594] hover:bg-[#003594]/90 font-medium">
              <Link href="/whitelist-wizard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Discord CTA */}
      <section className="bg-gray-100 py-16">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-[#003594] md:text-4xl">
            Join Our Discord Community
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Connect with other players, get server announcements, and participate in community events.
          </p>
          <Button asChild size="lg" className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white">
            <a href="https://discord.com/invite/MNcFhkjJcW" target="_blank" rel="noopener noreferrer">
              Join Discord Server
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003594] py-8 text-white">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} PittMC. Not officially affiliated with
            Mojang, Microsoft, or the University of Pittsburgh. This is an alumni-run server 
            to create an inclusive community for Pitt affiliates.
          </p>
        </div>
      </footer>
    </div>
  )
}
