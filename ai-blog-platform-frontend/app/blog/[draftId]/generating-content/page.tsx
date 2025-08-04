"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { StepperHeader } from "@/components/stepper-header"
import { Check, Loader2 } from "lucide-react"

export default function GeneratingContentPage() {
  const [currentTask, setCurrentTask] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const router = useRouter()
  const params = useParams()
  const draftId = params.draftId as string

  const tasks = [
    "Analyzing selected keyword and meta data",
    "Generating 9 content blocks with keyword focus",
    "Creating image prompts and citations",
    "Preparing content for editing"
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout

    // Start the visual progress
    interval = setInterval(() => {
      setCurrentTask((prev) => {
        const next = prev + 1
        if (next < tasks.length) {
          setCompletedTasks((completed) => [...completed, prev])
          return next
        } else {
          // Mark last task as completed and redirect
          setCompletedTasks((completed) => [...completed, prev])
          clearInterval(interval)
          setTimeout(() => {
            router.push(`/blog/${draftId}/editor`)
          }, 1000)
          return prev
        }
      })
    }, 2000) // Each task takes 2 seconds (total 8 seconds)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [draftId, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <StepperHeader currentStep={3} draftId={draftId} />
      
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Generating Your Content</h1>
              <p className="text-gray-600">AI is creating keyword-focused content blocks, images, and citations</p>
            </div>

            {/* Progress Tasks */}
            <div className="max-w-2xl mx-auto space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-500 ${
                    completedTasks.includes(index)
                      ? "bg-green-50 border-green-200"
                      : currentTask === index
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {completedTasks.includes(index) ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : currentTask === index ? (
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      completedTasks.includes(index)
                        ? "text-green-700"
                        : currentTask === index
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
