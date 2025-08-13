import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Calendar, ClipboardCheck, LogOut, User, GraduationCap, FileText } from "lucide-react"
import { signOut } from "@/lib/actions"

interface FacultyDashboardProps {
  user: any
  profile: any
}

export default async function FacultyDashboard({ user, profile }: FacultyDashboardProps) {
  const supabase = createClient()

  // Fetch faculty's assigned courses
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      departments (
        name
      )
    `)
    .eq("faculty_id", user.id)

  // Fetch total enrollments across all courses
  const { data: totalEnrollments } = await supabase
    .from("enrollments")
    .select("id")
    .in("course_id", courses?.map((c) => c.id) || [])
    .eq("status", "active")

  // Fetch recent attendance records
  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select(`
      *,
      profiles!attendance_student_id_fkey (
        full_name,
        student_id
      ),
      courses (
        name,
        code
      )
    `)
    .in("course_id", courses?.map((c) => c.id) || [])
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch upcoming exams
  const { data: upcomingExams } = await supabase
    .from("exams")
    .select(`
      *,
      courses (
        name,
        code
      )
    `)
    .in("course_id", courses?.map((c) => c.id) || [])
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date")
    .limit(5)

  // Fetch today's schedule
  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()

  const { data: todaySchedule } = await supabase
    .from("timetable")
    .select(`
      *,
      courses (
        name,
        code
      )
    `)
    .eq("day_of_week", dayOfWeek)
    .in("course_id", courses?.map((c) => c.id) || [])
    .order("start_time")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Faculty Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, Prof. {profile.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{profile.employee_id}</span>
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
                  <p className="text-sm font-medium text-gray-600">My Courses</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEnrollments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
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
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingExams?.length || 0}</p>
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
                <Calendar className="h-5 w-5 mr-2" />
                Today's Classes
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

          {/* My Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                My Courses
              </CardTitle>
              <CardDescription>Courses you are teaching</CardDescription>
            </CardHeader>
            <CardContent>
              {courses && courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{course.name}</h3>
                          <p className="text-sm text-gray-600">{course.code}</p>
                        </div>
                        <Badge variant="secondary">{course.credits} Credits</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{course.departments?.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {course.semester} {course.academic_year}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Students
                          </Button>
                          <Button size="sm" variant="outline">
                            Mark Attendance
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No courses assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2" />
                Recent Attendance
              </CardTitle>
              <CardDescription>Latest attendance records you marked</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttendance && recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.slice(0, 5).map((attendance) => (
                    <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{attendance.profiles.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {attendance.profiles.student_id} - {attendance.courses.name}
                        </p>
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

          {/* Upcoming Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Upcoming Exams
              </CardTitle>
              <CardDescription>Exams scheduled for your courses</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingExams && upcomingExams.length > 0 ? (
                <div className="space-y-3">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{exam.name}</p>
                          <p className="text-sm text-gray-600">
                            {exam.courses.name} ({exam.courses.code})
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {exam.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {new Date(exam.date).toLocaleDateString()} - Max Marks: {exam.max_marks}
                        </span>
                        <Button size="sm" variant="outline">
                          Add Results
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming exams</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for faculty members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-16 flex flex-col items-center justify-center">
                <ClipboardCheck className="h-6 w-6 mb-2" />
                Mark Attendance
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-transparent">
                <FileText className="h-6 w-6 mb-2" />
                Create Exam
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-transparent">
                <Users className="h-6 w-6 mb-2" />
                View All Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
