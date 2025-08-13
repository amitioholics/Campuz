"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createCourse(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const code = formData.get("code")
  const name = formData.get("name")
  const description = formData.get("description")
  const credits = formData.get("credits")
  const department = formData.get("department")
  const faculty = formData.get("faculty")
  const semester = formData.get("semester")
  const academicYear = formData.get("academicYear")

  if (!code || !name || !credits || !department || !semester || !academicYear) {
    return { error: "All required fields must be filled" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create courses" }
  }

  // Get user profile to check permissions
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "faculty")) {
    return { error: "You don't have permission to create courses" }
  }

  try {
    // Check if course code already exists
    const { data: existingCourse } = await supabase.from("courses").select("id").eq("code", code.toString()).single()

    if (existingCourse) {
      return { error: "Course code already exists" }
    }

    // Create the course
    const { error } = await supabase.from("courses").insert({
      code: code.toString(),
      name: name.toString(),
      description: description?.toString() || null,
      credits: Number.parseInt(credits.toString()),
      department_id: department.toString(),
      faculty_id: faculty?.toString() || (profile.role === "faculty" ? user.id : null),
      semester: semester.toString(),
      academic_year: academicYear.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/courses")
    return { success: "Course created successfully" }
  } catch (error) {
    console.error("Course creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function enrollStudent(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const courseId = formData.get("courseId")
  const studentEmail = formData.get("studentEmail")

  if (!courseId || !studentEmail) {
    return { error: "Course ID and student email are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to enroll students" }
  }

  // Get user profile to check permissions
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "faculty")) {
    return { error: "You don't have permission to enroll students" }
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

    // Check if student is already enrolled
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_id", courseId.toString())
      .single()

    if (existingEnrollment) {
      return { error: "Student is already enrolled in this course" }
    }

    // Enroll the student
    const { error } = await supabase.from("enrollments").insert({
      student_id: student.id,
      course_id: courseId.toString(),
      status: "active",
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/courses")
    return { success: "Student enrolled successfully" }
  } catch (error) {
    console.error("Student enrollment error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
