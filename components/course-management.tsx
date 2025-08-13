import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Users, Search, Filter, GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import CreateCourseForm from "@/components/create-course-form"
import EnrollStudentForm from "@/components/enroll-student-form"

interface CourseManagementProps {
  user: any
  profile: any
}

export default async function CourseManagement({ user, profile }: CourseManagementProps) {
  const supabase = createClient()

  // Fetch courses based on user role
  let coursesQuery = supabase.from("courses").select(`
    *,
    departments (
      name
    ),
    profiles!courses_faculty_id_fkey (
      full_name
    )
  `)

  // If faculty, only show their courses
  if (profile.role === "faculty") {
    coursesQuery = coursesQuery.eq("faculty_id", user.id)
  }

  const { data: courses } = await coursesQuery.order("created_at", { ascending: false })

  // Fetch departments for course creation
  const { data: departments } = await supabase.from("departments").select("*").order("name")

  // Fetch faculty members for course assignment
  const { data: facultyMembers } = await supabase.from("profiles").select("*").eq("role", "faculty").order("full_name")

  // Get enrollment counts for each course
  const coursesWithEnrollments = await Promise.all(
    (courses || []).map(async (course) => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", course.id)
        .eq("status", "active")

      return {
        ...course,
        enrollmentCount: enrollments?.length || 0,
      }
    }),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                <p className="text-sm text-gray-600">Manage courses and enrollments</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {profile.role === "faculty" ? "My Courses" : "Total Courses"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {coursesWithEnrollments.reduce((sum, course) => sum + course.enrollmentCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search courses..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {(profile.role === "admin" || profile.role === "faculty") && (
            <div className="flex space-x-2">
              <CreateCourseForm departments={departments} facultyMembers={facultyMembers} userRole={profile.role} />
            </div>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {coursesWithEnrollments.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-600">{course.code}</CardDescription>
                  </div>
                  <Badge variant="secondary">{course.credits} Credits</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{course.departments?.name || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Faculty</p>
                    <p className="font-medium">{course.profiles?.full_name || "Not Assigned"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Academic Year</p>
                    <p className="font-medium">
                      {course.semester} {course.academic_year}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{course.enrollmentCount} students</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>

                  {course.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-sm text-gray-800 line-clamp-2">{course.description}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      View Details
                    </Button>
                    {(profile.role === "admin" || course.faculty_id === user.id) && (
                      <EnrollStudentForm courseId={course.id} courseName={course.name} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {coursesWithEnrollments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {profile.role === "faculty"
                  ? "You haven't been assigned any courses yet."
                  : "Get started by creating your first course."}
              </p>
              {(profile.role === "admin" || profile.role === "faculty") && (
                <CreateCourseForm departments={departments} facultyMembers={facultyMembers} userRole={profile.role} />
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
