import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StudentDashboard from "@/components/student-dashboard"
import FacultyDashboard from "@/components/faculty-dashboard"
import AdminDashboard from "@/components/admin-dashboard"

export default async function DashboardPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Get the user and their profile
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Render appropriate dashboard based on role
  switch (profile.role) {
    case "student":
      return <StudentDashboard user={user} profile={profile} />
    case "faculty":
      return <FacultyDashboard user={user} profile={profile} />
    case "admin":
      return <AdminDashboard user={user} profile={profile} />
    default:
      redirect("/auth/login")
  }
}
