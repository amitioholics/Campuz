"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const role = formData.get("role")
  const studentId = formData.get("studentId")
  const employeeId = formData.get("employeeId")
  const department = formData.get("department")

  if (!email || !password || !fullName || !role) {
    return { error: "Email, password, full name, and role are required" }
  }

  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"

    // Create user account WITHOUT metadata to avoid trigger issues
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    })

    if (signUpError) {
      console.error("Supabase signup error:", signUpError)
      return { error: signUpError.message }
    }

    // Store form data in session storage or cookies for later use
    // We'll create the profile after email confirmation
    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "Database error saving new user" }
  }
}

// Sign out action
export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}
