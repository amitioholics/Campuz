"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, GraduationCap } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { useState, useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [mounted, setMounted] = useState(false)

  // Fix hydration issue
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Join College Portal</CardTitle>
          <CardDescription className="text-lg">Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <GraduationCap className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-3xl font-bold">Join College Portal</CardTitle>
        <CardDescription className="text-lg">Create your account to get started</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {state.success}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required className="h-12" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input id="email" name="email" type="email" placeholder="john@college.edu" required className="h-12" />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input id="password" name="password" type="password" required className="h-12" />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole} required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={selectedRole} />
            </div>

            {selectedRole === "student" && (
              <div className="space-y-2">
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <Input id="studentId" name="studentId" type="text" placeholder="STU2024001" className="h-12" />
              </div>
            )}

            {(selectedRole === "faculty" || selectedRole === "admin") && (
              <div className="space-y-2">
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <Input id="employeeId" name="employeeId" type="text" placeholder="EMP2024001" className="h-12" />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="department" value={selectedDepartment} />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
