"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Loader2 } from "lucide-react"
import { enrollStudent } from "@/lib/course-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling Student...
        </>
      ) : (
        "Enroll Student"
      )}
    </Button>
  )
}

interface EnrollStudentFormProps {
  courseId: string
  courseName: string
}

export default function EnrollStudentForm({ courseId, courseName }: EnrollStudentFormProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(enrollStudent, null)

  // Close dialog on successful enrollment
  if (state?.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <UserPlus className="h-4 w-4 mr-1" />
          Enroll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>Add a student to {courseName}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="courseId" value={courseId} />

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
            <label htmlFor="studentEmail" className="text-sm font-medium">
              Student Email *
            </label>
            <Input id="studentEmail" name="studentEmail" type="email" placeholder="student@college.edu" required />
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
