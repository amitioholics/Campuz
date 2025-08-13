import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Calendar, TrendingUp, Search, GraduationCap, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import MarkAttendanceForm from "@/components/mark-attendance-form"

interface AttendanceManagementProps {
  user: any
  profile: any
}

export default async function AttendanceManagement({ user, profile }: AttendanceManagementProps) {
  const supabase = createClient()

  // Fetch attendance data based on user role
  let attendanceQuery = supabase.from("attendance").select(`
    *,
    profiles!attendance_student_id_fkey (
      full_name,
      student_id
    ),
    courses (
      id,
      name,
      code,
      profiles!courses_faculty_id_fkey (
        full_name
      )
    )
  `)

  // If faculty, only show attendance for their courses
  if (profile.role === "faculty") {
    const { data: facultyCourses } = await supabase.from("courses").select("id").eq("faculty_id", user.id)
    const courseIds = facultyCourses?.map((c) => c.id) || []
    attendanceQuery = attendanceQuery.in("course_id", courseIds)
  }

  // If student, only show their attendance
  if (profile.role === "student") {
    attendanceQuery = attendanceQuery.eq("student_id", user.id)
  }

  const { data: attendanceRecords } = await attendanceQuery.order("date", { ascending: false }).limit(50)

  // Fetch courses for attendance marking (faculty and admin only)
  let coursesForAttendance = []
  if (profile.role === "faculty") {
    const { data: facultyCourses } = await supabase.from("courses").select("*").eq("faculty_id", user.id).order("name")
    coursesForAttendance = facultyCourses || []
  } else if (profile.role === "admin") {
    const { data: allCourses } = await supabase.from("courses").select("*").order("name")
    coursesForAttendance = allCourses || []
  }

  // Calculate attendance statistics
  const todayAttendance = attendanceRecords?.filter((record) => record.date === new Date().toISOString().split("T")[0])
  const presentToday = todayAttendance?.filter((record) => record.status === "present")
  const totalPresent = attendanceRecords?.filter((record) => record.status === "present")
  const totalAbsent = attendanceRecords?.filter((record) => record.status === "absent")

  // Calculate attendance percentage for student
  let studentAttendancePercentage = 0
  if (profile.role === "student" && attendanceRecords && attendanceRecords.length > 0) {
    const presentCount = attendanceRecords.filter((record) => record.status === "present").length
    studentAttendancePercentage = Math.round((presentCount / attendanceRecords.length) * 100)
  }

  // Get course-wise attendance for student
  let courseWiseAttendance = []
  if (profile.role === "student") {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        courses (
          id,
          name,
          code
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "active")

    courseWiseAttendance = await Promise.all(
      (enrollments || []).map(async (enrollment) => {
        const { data: courseAttendance } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", user.id)
          .eq("course_id", enrollment.courses.id)

        const presentCount = courseAttendance?.filter((record) => record.status === "present").length || 0
        const totalCount = courseAttendance?.length || 0
        const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

        return {
          course: enrollment.courses,
          totalClasses: totalCount,
          presentClasses: presentCount,
          percentage,
        }
      }),
    )
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-sm text-gray-600">
                  {profile.role === "student"
                    ? "View your attendance records and statistics"
                    : "Mark and manage student attendance"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {profile.role === "student" ? "Overall Attendance" : "Total Records"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.role === "student" ? `${studentAttendancePercentage}%` : attendanceRecords?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {profile.role === "student" ? "Classes Attended" : "Present Today"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.role === "student" ? totalPresent?.length || 0 : presentToday?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {profile.role === "student" ? "Classes Missed" : "Today's Total"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.role === "student" ? totalAbsent?.length || 0 : todayAttendance?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {profile.role === "student" ? "Enrolled Courses" : "My Courses"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.role === "student" ? courseWiseAttendance.length : coursesForAttendance.length}
                  </p>
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
              <Input placeholder="Search attendance..." className="pl-10 w-64" />
            </div>
          </div>

          {(profile.role === "admin" || profile.role === "faculty") && (
            <MarkAttendanceForm courses={coursesForAttendance} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course-wise Attendance (Student View) */}
          {profile.role === "student" && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Course-wise Attendance
                </CardTitle>
                <CardDescription>Your attendance percentage for each enrolled course</CardDescription>
              </CardHeader>
              <CardContent>
                {courseWiseAttendance.length > 0 ? (
                  <div className="space-y-4">
                    {courseWiseAttendance.map((courseData) => (
                      <div key={courseData.course.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{courseData.course.name}</h3>
                            <p className="text-sm text-gray-600">{courseData.course.code}</p>
                          </div>
                          <Badge
                            variant={courseData.percentage >= 75 ? "default" : "destructive"}
                            className={courseData.percentage >= 75 ? "bg-green-600" : ""}
                          >
                            {courseData.percentage}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>
                              Present: {courseData.presentClasses}/{courseData.totalClasses} classes
                            </span>
                            <span>{courseData.percentage >= 75 ? "Good" : "Below 75%"}</span>
                          </div>
                          <Progress value={courseData.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attendance records found</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Attendance Records */}
          <Card className={profile.role === "student" ? "lg:col-span-2" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {profile.role === "student" ? "My Attendance History" : "Recent Attendance Records"}
              </CardTitle>
              <CardDescription>
                {profile.role === "student" ? "Your recent attendance records" : "Latest attendance entries"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords && attendanceRecords.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceRecords.slice(0, 20).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        {profile.role !== "student" && (
                          <p className="font-medium text-gray-900">{record.profiles.full_name}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {profile.role !== "student" && `${record.profiles.student_id} - `}
                          {record.courses.name} ({record.courses.code})
                        </p>
                        <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            record.status === "present"
                              ? "default"
                              : record.status === "late"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            record.status === "present"
                              ? "bg-green-600"
                              : record.status === "late"
                                ? "bg-yellow-600"
                                : ""
                          }
                        >
                          {record.status}
                        </Badge>
                        {profile.role !== "student" && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {record.courses.profiles?.full_name || "System"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No attendance records found</p>
              )}
            </CardContent>
          </Card>

          {/* Today's Attendance Summary (Faculty/Admin View) */}
          {profile.role !== "student" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Summary
                </CardTitle>
                <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                {todayAttendance && todayAttendance.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {todayAttendance.filter((r) => r.status === "present").length}
                        </p>
                        <p className="text-sm text-green-700">Present</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          {todayAttendance.filter((r) => r.status === "late").length}
                        </p>
                        <p className="text-sm text-yellow-700">Late</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {todayAttendance.filter((r) => r.status === "absent").length}
                        </p>
                        <p className="text-sm text-red-700">Absent</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-gray-600 text-center">
                        Total attendance marked: {todayAttendance.length} records
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attendance marked today</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
