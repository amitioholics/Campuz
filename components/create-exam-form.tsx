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
import { Plus, Loader2 } from "lucide-react"
import { createExam } from "@/lib/exam-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Exam...
        </>
      ) : (
        "Create Exam"
      )}
    </Button>
  )
}

interface CreateExamFormProps {
  courses: any[]
}

export default function CreateExamForm({ courses }: CreateExamFormProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(createExam, null)

  // Close dialog on successful creation
  if (state?.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>Schedule a new exam for your course.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Exam Name *
            </label>
            <Input id="name" name="name" placeholder="Midterm Examination" required />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Exam Type *
              </label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="maxMarks" className="text-sm font-medium">
                Max Marks *
              </label>
              <Input id="maxMarks" name="maxMarks" type="number" min="1" placeholder="100" required />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Exam Date *
            </label>
            <Input id="date" name="date" type="date" required />
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
