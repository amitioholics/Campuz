import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, BookOpen, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <h1 className="text-2xl font-bold mb-4 text-white">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Check if user is logged in
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <GraduationCap className="h-10 w-10 text-purple-400" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <h1 className="text-3xl font-bold font-display ml-3 gradient-text">Campuz</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white bg-transparent"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-6xl font-bold font-display text-white mb-6 leading-tight">
              The Future of
              <span className="gradient-text block">Campus Management</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience seamless campus life with Campuz - where students, faculty, and administrators connect through
              intelligent course management, real-time analytics, and modern collaboration tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-effect p-8 rounded-2xl card-hover">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold font-display mb-4 text-white">Smart Roles</h3>
              <p className="text-gray-300 leading-relaxed">
                Intelligent role-based dashboards that adapt to your needs, whether you're a student, faculty, or admin.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl card-hover">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold font-display mb-4 text-white">Course Intelligence</h3>
              <p className="text-gray-300 leading-relaxed">
                AI-powered course recommendations, automated scheduling, and intelligent progress tracking.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl card-hover">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold font-display mb-4 text-white">Lightning Fast</h3>
              <p className="text-gray-300 leading-relaxed">
                Real-time updates, instant notifications, and blazing-fast performance for seamless campus operations.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl bg-transparent"
              >
                Access Portal
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 text-center">
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-gray-400 text-sm">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-400 text-sm">Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Multi-Role Support</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
