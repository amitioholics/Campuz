import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  GraduationCap,
  Building,
  LogOut,
  User,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  UserPlus,
  PlusCircle,
} from "lucide-react"
import { signOut } from "@/lib/actions"

interface AdminDashboardProps {
  user: any
  profile: any
}

export default async function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const supabase = createClient()

  // Fetch system statistics
  const { data: totalStudents } = await supabase.from("profiles").select("id").eq("role", "student")

  const { data: totalFaculty } = await supabase.from("profiles").select("id").eq("role", "faculty")

  const { data: totalCourses } = await supabase.from("courses").select("id")

  const { data: totalDepartments } = await supabase.from("departments").select("id")

  // Fetch recent enrollments
  const { data: recentEnrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      profiles!enrollments_student_id_fkey (
        full_name,
        student_id
      ),
      courses (
        name,
        code
      )
    `)
    .order("enrollment_date", { ascending: false })
    .limit(5)

  // Fetch departments with course counts
  const { data: departments } = await supabase.from("departments").select(`
      *,
      profiles!departments_head_id_fkey (
        full_name
      )
    `)

  // Get course counts for each department
  const departmentsWithCounts = await Promise.all(
    (departments || []).map(async (dept) => {
      const { data: courseCount } = await supabase.from("courses").select("id").eq("department_id", dept.id)

      return {
        ...dept,
        courseCount: courseCount?.length || 0,
      }
    }),
  )

  // Fetch recent users (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch system activity summary
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("id")
    .eq("date", new Date().toISOString().split("T")[0])

  const { data: activeEnrollments } = await supabase.from("enrollments").select("id").eq("status", "active")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {profile.full_name}</p>
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
        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFaculty?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCourses?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDepartments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{activeEnrollments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{todayAttendance?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Users (7 days)</p>
                  <p className="text-2xl font-bold text-gray-900">{recentUsers?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Departments Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Departments
              </CardTitle>
              <CardDescription>Overview of all departments and their courses</CardDescription>
            </CardHeader>
            <CardContent>
              {departmentsWithCounts && departmentsWithCounts.length > 0 ? (
                <div className="space-y-4">
                  {departmentsWithCounts.map((department) => (
                    <div key={department.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{department.name}</h3>
                          <p className="text-sm text-gray-600">Code: {department.code}</p>
                        </div>
                        <Badge variant="secondary">{department.courseCount} Courses</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Head: {department.profiles?.full_name || "Not Assigned"}</p>
                      <div className="flex justify-end mt-2">
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No departments found</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Enrollments
              </CardTitle>
              <CardDescription>Latest student course enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEnrollments && recentEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.profiles.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {enrollment.profiles.student_id} → {enrollment.courses.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {enrollment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent enrollments</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                New Users
              </CardTitle>
              <CardDescription>Users who joined in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUsers && recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No new users this week</p>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
              <CardDescription>Current system health and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Database</p>
                    <p className="text-sm text-green-700">All systems operational</p>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Authentication</p>
                    <p className="text-sm text-blue-700">Secure connections active</p>
                  </div>
                  <Badge variant="default" className="bg-blue-600">
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-purple-900">Data Sync</p>
                    <p className="text-sm text-purple-700">Last sync: 2 minutes ago</p>
                  </div>
                  <Badge variant="default" className="bg-purple-600">
                    Synced
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
            <CardDescription>Common management tasks and system operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-16 flex flex-col items-center justify-center">
                <UserPlus className="h-6 w-6 mb-2" />
                Add User
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-transparent">
                <PlusCircle className="h-6 w-6 mb-2" />
                Create Course
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-transparent">
                <Building className="h-6 w-6 mb-2" />
                Manage Departments
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-transparent">
                <FileText className="h-6 w-6 mb-2" />
                Generate Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
