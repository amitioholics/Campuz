"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createExam(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const course = formData.get("course")
  const type = formData.get("type")
  const maxMarks = formData.get("maxMarks")
  const date = formData.get("date")

  if (!name || !course || !type || !maxMarks || !date) {
    return { error: "All fields are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create exams" }
  }

  // Get user profile to check permissions
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "faculty")) {
    return { error: "You don't have permission to create exams" }
  }

  try {
    // Create the exam
    const { error } = await supabase.from("exams").insert({
      name: name.toString(),
      course_id: course.toString(),
      type: type.toString(),
      max_marks: Number.parseInt(maxMarks.toString()),
      date: date.toString(),
      created_by: user.id,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/exams")
    return { success: "Exam created successfully" }
  } catch (error) {
    console.error("Exam creation error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function addResult(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const examId = formData.get("examId")
  const studentEmail = formData.get("studentEmail")
  const marksObtained = formData.get("marksObtained")
  const grade = formData.get("grade")

  if (!examId || !studentEmail || !marksObtained) {
    return { error: "Exam ID, student email, and marks are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to add results" }
  }

  // Get user profile to check permissions
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "faculty")) {
    return { error: "You don't have permission to add results" }
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

    // Check if result already exists
    const { data: existingResult } = await supabase
      .from("results")
      .select("id")
      .eq("student_id", student.id)
      .eq("exam_id", examId.toString())
      .single()

    if (existingResult) {
      return { error: "Result already exists for this student and exam" }
    }

    // Validate marks
    const { data: exam } = await supabase.from("exams").select("max_marks").eq("id", examId.toString()).single()

    if (!exam) {
      return { error: "Exam not found" }
    }

    const marks = Number.parseInt(marksObtained.toString())
    if (marks < 0 || marks > exam.max_marks) {
      return { error: `Marks must be between 0 and ${exam.max_marks}` }
    }

    // Add the result
    const { error } = await supabase.from("results").insert({
      student_id: student.id,
      exam_id: examId.toString(),
      marks_obtained: marks,
      grade: grade?.toString() || null,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/exams")
    return { success: "Result added successfully" }
  } catch (error) {
    console.error("Result addition error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
