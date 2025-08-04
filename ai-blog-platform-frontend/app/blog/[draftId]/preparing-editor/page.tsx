"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { FileText, Sparkles } from "lucide-react"
import { StepperHeader } from "@/components/stepper-header"

export default function PreparingEditorPage() {
  const router = useRouter()
  const params = useParams()
  const draftId = params.draftId as string

  useEffect(() => {
    // Quick transition to editor page
    const timer = setTimeout(() => {
      router.push(`/blog/${draftId}/editor`)
    }, 1500) // 1.5 seconds loading

    return () => clearTimeout(timer)
  }, [draftId, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <StepperHeader currentStep={3} draftId={draftId} />
      
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
              <h1 className="text-2xl font-bold text-gray-900">Preparing Editor</h1>
              <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Setting up your content editor with generated blocks and images...</p>
          </div>

          {/* Loading Animation */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Loading content blocks</p>
              <p className="text-sm font-medium text-gray-700">Preparing image galleries</p>
              <p className="text-sm font-medium text-gray-700">Setting up editing tools</p>
            </div>

            {/* Simple Progress Indicator */}
            <div className="max-w-md mx-auto text-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out animate-pulse"
                  style={{
                    width: "80%",
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Almost ready for editing...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
