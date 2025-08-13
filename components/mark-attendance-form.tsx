"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, Loader2 } from "lucide-react"
import { markAttendance } from "@/lib/attendance-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Marking Attendance...
        </>
      ) : (
        "Mark Attendance"
      )}
    </Button>
  )
}

interface MarkAttendanceFormProps {
  courses: any[]
}

export default function MarkAttendanceForm({ courses }: MarkAttendanceFormProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(markAttendance, null)

  // Close dialog on successful marking
  if (state?.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Student Attendance</DialogTitle>
          <DialogDescription>Record attendance for a student in your course.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
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

          <div className="space-y-2">
            <label htmlFor="course" className="text-sm font-medium">
              Course *
            </label>
            <Select name="course" required>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="studentEmail" className="text-sm font-medium">
              Student Email *
            </label>
            <Input id="studentEmail" name="studentEmail" type="email" placeholder="student@college.edu" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date *
              </label>
              <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status *
              </label>
              <Select name="status" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
