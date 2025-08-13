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
import { addResult } from "@/lib/exam-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding Result...
        </>
      ) : (
        "Add Result"
      )}
    </Button>
  )
}

interface AddResultFormProps {
  examId: string
  examName: string
  maxMarks: number
}

export default function AddResultForm({ examId, examName, maxMarks }: AddResultFormProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(addResult, null)

  // Close dialog on successful addition
  if (state?.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Plus className="h-4 w-4 mr-1" />
          Add Result
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Student Result</DialogTitle>
          <DialogDescription>Add result for {examName}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="examId" value={examId} />

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

          <div className="space-y-2">
            <label htmlFor="marksObtained" className="text-sm font-medium">
              Marks Obtained *
            </label>
            <Input
              id="marksObtained"
              name="marksObtained"
              type="number"
              min="0"
              max={maxMarks}
              placeholder={`Out of ${maxMarks}`}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="grade" className="text-sm font-medium">
              Grade (Optional)
            </label>
            <Select name="grade">
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="C+">C+</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="C-">C-</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  )
}
