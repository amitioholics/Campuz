"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { createCourse } from "@/lib/course-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Course...
        </>
      ) : (
        "Create Course"
      )}
    </Button>
  )
}

interface CreateCourseFormProps {
  departments: any[]
  facultyMembers: any[]
  userRole: string
}

export default function CreateCourseForm({ departments, facultyMembers, userRole }: CreateCourseFormProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(createCourse, null)

  // Close dialog on successful creation
  if (state?.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>Add a new course to the system with all necessary details.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Course Code *
              </label>
              <Input id="code" name="code" placeholder="CS101" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="credits" className="text-sm font-medium">
                Credits *
              </label>
              <Input id="credits" name="credits" type="number" min="1" max="6" defaultValue="3" required />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Course Name *
            </label>
            <Input id="name" name="name" placeholder="Introduction to Computer Science" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea id="description" name="description" placeholder="Course description and objectives..." rows={3} />
          </div>

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">
              Department *
            </label>
            <Select name="department" required>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {userRole === "admin" && (
            <div className="space-y-2">
              <label htmlFor="faculty" className="text-sm font-medium">
                Assign Faculty
              </label>
              <Select name="faculty">
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty member" />
                </SelectTrigger>
                <SelectContent>
                  {facultyMembers?.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.full_name} ({faculty.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="semester" className="text-sm font-medium">
                Semester *
              </label>
              <Select name="semester" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="academicYear" className="text-sm font-medium">
                Academic Year *
              </label>
              <Input id="academicYear" name="academicYear" placeholder="2024-25" required />
            </div>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
