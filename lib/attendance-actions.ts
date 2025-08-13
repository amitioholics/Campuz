"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function markAttendance(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const course = formData.get("course")
  const studentEmail = formData.get("studentEmail")
  const date = formData.get("date")
  const status = formData.get("status")

  if (!course || !studentEmail || !date || !status) {
    return { error: "All fields are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to mark attendance" }
  }

  // Get user profile to check permissions
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "faculty")) {
    return { error: "You don't have permission to mark attendance" }
  }

  try {
    // Find the student by email
    const { data: student } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", studentEmail.toString())
      .eq("role", "student")
      .single()

    if (!student) {
      return { error: "Student not found or email is not registered as a student" }
    }

    // Check if student is enrolled in the course
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_id", course.toString())
      .eq("status", "active")
      .single()

    if (!enrollment) {
      return { error: "Student is not enrolled in this course" }
    }

    // Check if attendance already exists for this date
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_id", course.toString())
      .eq("date", date.toString())
      .single()

    if (existingAttendance) {
      // Update existing attendance
      const { error } = await supabase
        .from("attendance")
        .update({
          status: status.toString(),
          marked_by: user.id,
        })
        .eq("id", existingAttendance.id)

      if (error) {
        return { error: error.message }
      }

      revalidatePath("/attendance")
      return { success: "Attendance updated successfully" }
    } else {
      // Create new attendance record
      const { error } = await supabase.from("attendance").insert({
        student_id: student.id,
        course_id: course.toString(),
        date: date.toString(),
        status: status.toString(),
        marked_by: user.id,
      })

      if (error) {
        return { error: error.message }
      }

      revalidatePath("/attendance")
      return { success: "Attendance marked successfully" }
    }
  } catch (error) {
    console.error("Attendance marking error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
