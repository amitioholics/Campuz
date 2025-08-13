import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Calendar, Clock, GraduationCap, LogOut, User, TrendingUp, CheckCircle } from "lucide-react"
import { signOut } from "@/lib/actions"

interface StudentDashboardProps {
  user: any
  profile: any
}

export default async function StudentDashboard({ user, profile }: StudentDashboardProps) {
  const supabase = createClient()

  // Fetch student's enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      courses (
        id,
        name,
        code,
        credits,
        semester,
        academic_year,
        profiles!courses_faculty_id_fkey (
          full_name
        )
      )
    `)
    .eq("student_id", user.id)
    .eq("status", "active")

  // Fetch recent attendance
  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select(`
      *,
      courses (
        name,
        code
      )
    `)
    .eq("student_id", user.id)
    .order("date", { ascending: false })
    .limit(5)

  // Fetch recent results
  const { data: recentResults } = await supabase
    .from("results")
    .select(`
      *,
      exams (
        name,
        type,
        max_marks,
        courses (
          name,
          code
        )
      )
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch today's timetable
  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay() // Convert Sunday from 0 to 7

  const { data: todaySchedule } = await supabase
    .from("timetable")
    .select(`
      *,
      courses (
        name,
        code,
        profiles!courses_faculty_id_fkey (
          full_name
        )
      )
    `)
    .eq("day_of_week", dayOfWeek)
    .in("course_id", enrollments?.map((e) => e.courses.id) || [])
    .order("start_time")

  // Calculate attendance percentage
  const calculateAttendancePercentage = async (courseId: string) => {
    const { data: totalClasses } = await supabase
      .from("attendance")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)

    const { data: presentClasses } = await supabase
      .from("attendance")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "present")

    if (!totalClasses || totalClasses.length === 0) return 0
    return Math.round(((presentClasses?.length || 0) / totalClasses.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{profile.student_id}</span>
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{enrollments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{todaySchedule?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Results</p>
                  <p className="text-2xl font-bold text-gray-900">{recentResults?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Department</p>
                  <p className="text-lg font-bold text-gray-900">{profile.department || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaySchedule && todaySchedule.length > 0 ? (
                <div className="space-y-4">
                  {todaySchedule.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{schedule.courses.name}</p>
                        <p className="text-sm text-gray-600">{schedule.courses.code}</p>
                        <p className="text-sm text-gray-500">Prof. {schedule.courses.profiles?.full_name || "TBA"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                        <p className="text-sm text-gray-600">Room {schedule.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
              )}
            </CardContent>
          </Card>

          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                My Courses
              </CardTitle>
              <CardDescription>Current semester enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{enrollment.courses.name}</h3>
                          <p className="text-sm text-gray-600">{enrollment.courses.code}</p>
                        </div>
                        <Badge variant="secondary">{enrollment.courses.credits} Credits</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Prof. {enrollment.courses.profiles?.full_name || "TBA"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {enrollment.courses.semester} {enrollment.courses.academic_year}
                        </span>
                        <Badge variant="outline" className="text-green-600">
                          {enrollment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No courses enrolled</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Recent Attendance
              </CardTitle>
              <CardDescription>Last 5 attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttendance && recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((attendance) => (
                    <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{attendance.courses.name}</p>
                        <p className="text-sm text-gray-600">{attendance.courses.code}</p>
                        <p className="text-sm text-gray-500">{new Date(attendance.date).toLocaleDateString()}</p>
                      </div>
                      <Badge
                        variant={
                          attendance.status === "present"
                            ? "default"
                            : attendance.status === "late"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {attendance.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No attendance records</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Results
              </CardTitle>
              <CardDescription>Latest exam and assignment results</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults && recentResults.length > 0 ? (
                <div className="space-y-3">
                  {recentResults.map((result) => (
                    <div key={result.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{result.exams.name}</p>
                          <p className="text-sm text-gray-600">
                            {result.exams.courses.name} ({result.exams.courses.code})
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {result.exams.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Score: {result.marks_obtained}/{result.exams.max_marks}
                        </span>
                        {result.grade && <Badge variant="secondary">Grade: {result.grade}</Badge>}
                      </div>
                      <Progress value={(result.marks_obtained / result.exams.max_marks) * 100} className="mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No results available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
