"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Eye, CheckCircle } from "lucide-react"
import { StepperHeader } from "@/components/stepper-header"

export default function PreparingReviewPage() {
  const router = useRouter()
  const params = useParams()
  const draftId = params.draftId as string

  useEffect(() => {
    // Quick transition to review page
    const timer = setTimeout(() => {
      router.push(`/blog/${draftId}/review`)
    }, 1200) // 1.2 seconds loading

    return () => clearTimeout(timer)
  }, [draftId, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <StepperHeader currentStep={4} draftId={draftId} />
      
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Eye className="h-8 w-8 text-blue-600 animate-pulse" />
              <h1 className="text-2xl font-bold text-gray-900">Preparing Review</h1>
              <CheckCircle className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Finalizing your content for review and preparing deployment options...</p>
          </div>

          {/* Loading Animation */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Saving your changes</p>
              <p className="text-sm font-medium text-gray-700">Generating preview</p>
              <p className="text-sm font-medium text-gray-700">Checking WordPress connection</p>
            </div>

            {/* Simple Progress Indicator */}
            <div className="max-w-md mx-auto text-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out animate-pulse"
                  style={{
                    width: "85%",
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Preparing final review...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
