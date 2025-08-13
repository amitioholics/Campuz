import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { FileText, Calendar, TrendingUp, Search, GraduationCap, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import CreateExamForm from "@/components/create-exam-form"
import AddResultForm from "@/components/add-result-form"

interface ExamManagementProps {
  user: any
  profile: any
}

export default async function ExamManagement({ user, profile }: ExamManagementProps) {
  const supabase = createClient()

  // Fetch exams based on user role
  let examsQuery = supabase.from("exams").select(`
    *,
    courses (
      id,
      name,
      code,
      profiles!courses_faculty_id_fkey (
        full_name
      )
    )
  `)

  // If faculty, only show exams for their courses
  if (profile.role === "faculty") {
    const { data: facultyCourses } = await supabase.from("courses").select("id").eq("faculty_id", user.id)
    const courseIds = facultyCourses?.map((c) => c.id) || []
    examsQuery = examsQuery.in("course_id", courseIds)
  }

  // If student, show exams for enrolled courses
  if (profile.role === "student") {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", user.id)
      .eq("status", "active")
    const courseIds = enrollments?.map((e) => e.course_id) || []
    examsQuery = examsQuery.in("course_id", courseIds)
  }

  const { data: exams } = await examsQuery.order("date", { ascending: false })

  // Fetch courses for exam creation (faculty and admin only)
  let coursesForExams = []
  if (profile.role === "faculty") {
    const { data: facultyCourses } = await supabase.from("courses").select("*").eq("faculty_id", user.id).order("name")
    coursesForExams = facultyCourses || []
  } else if (profile.role === "admin") {
    const { data: allCourses } = await supabase.from("courses").select("*").order("name")
    coursesForExams = allCourses || []
  }

  // Get results for each exam
  const examsWithResults = await Promise.all(
    (exams || []).map(async (exam) => {
      const { data: results } = await supabase.from("results").select("*").eq("exam_id", exam.id)

      // If student, get their specific result
      let studentResult = null
      if (profile.role === "student") {
        const { data: result } = await supabase
          .from("results")
          .select("*")
          .eq("exam_id", exam.id)
          .eq("student_id", user.id)
          .single()
        studentResult = result
      }

      return {
        ...exam,
        resultCount: results?.length || 0,
        studentResult,
      }
    }),
  )

  // Calculate statistics
  const upcomingExams = examsWithResults.filter((exam) => new Date(exam.date) > new Date())
  const completedExams = examsWithResults.filter((exam) => new Date(exam.date) <= new Date())

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
                <h1 className="text-2xl font-bold text-gray-900">Exam & Results Management</h1>
                <p className="text-sm text-gray-600">
                  {profile.role === "student"
                    ? "View your exam schedule and results"
                    : "Manage exams and student results"}
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
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{exams?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingExams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedExams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Results Entered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {examsWithResults.reduce((sum, exam) => sum + exam.resultCount, 0)}
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
              <Input placeholder="Search exams..." className="pl-10 w-64" />
            </div>
          </div>

          {(profile.role === "admin" || profile.role === "faculty") && <CreateExamForm courses={coursesForExams} />}
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {examsWithResults.map((exam) => {
            const isUpcoming = new Date(exam.date) > new Date()
            const percentage = exam.studentResult
              ? Math.round((exam.studentResult.marks_obtained / exam.max_marks) * 100)
              : 0

            return (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{exam.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-blue-600">
                        {exam.courses.name} ({exam.courses.code})
                      </CardDescription>
                    </div>
                    <Badge variant={isUpcoming ? "default" : "secondary"} className="capitalize">
                      {exam.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{new Date(exam.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Max Marks</p>
                        <p className="font-medium">{exam.max_marks}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Faculty</p>
                      <p className="font-medium">{exam.courses.profiles?.full_name || "N/A"}</p>
                    </div>

                    {profile.role === "student" && exam.studentResult && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">Your Score</p>
                          <p className="font-medium">
                            {exam.studentResult.marks_obtained}/{exam.max_marks} ({percentage}%)
                          </p>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        {exam.studentResult.grade && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">Grade</p>
                            <Badge variant="outline">{exam.studentResult.grade}</Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {profile.role !== "student" && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{exam.resultCount} results entered</span>
                        </div>
                        <Badge variant={isUpcoming ? "outline" : "default"}>
                          {isUpcoming ? "Upcoming" : "Completed"}
                        </Badge>
                      </div>
                    )}

                    {(profile.role === "admin" || profile.role === "faculty") && !isUpcoming && (
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          View Results
                        </Button>
                        <AddResultForm examId={exam.id} examName={exam.name} maxMarks={exam.max_marks} />
                      </div>
                    )}

                    {profile.role === "student" && !exam.studentResult && !isUpcoming && (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">Result not yet published</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {examsWithResults.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600 mb-4">
                {profile.role === "student"
                  ? "No exams scheduled for your enrolled courses."
                  : "Get started by creating your first exam."}
              </p>
              {(profile.role === "admin" || profile.role === "faculty") && <CreateExamForm courses={coursesForExams} />}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
