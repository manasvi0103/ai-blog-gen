"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sparkles } from "lucide-react"
import { StepperHeader } from "@/components/stepper-header"

export default function GeneratingMetaPage() {
  const router = useRouter()
  const params = useParams()
  const draftId = params.draftId as string

  useEffect(() => {
    // Show meta generation animation then redirect
    const timer = setTimeout(() => {
      router.push(`/blog/${draftId}/meta`)
    }, 2000) // 2 seconds for meta generation

    return () => clearTimeout(timer)
  }, [draftId, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <StepperHeader currentStep={2} draftId={draftId} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
              <h1 className="text-2xl font-bold text-gray-900">Generating Meta Options</h1>
              <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-600">AI is creating SEO-optimized titles and descriptions for your selected keyword...</p>
          </div>

          {/* Loading Animation */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Analyzing keyword performance</p>
              <p className="text-sm font-medium text-gray-700">Creating H1 title variations</p>
              <p className="text-sm font-medium text-gray-700">Generating meta descriptions</p>
            </div>

            {/* Simple Progress Indicator */}
            <div className="max-w-md mx-auto text-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out animate-pulse"
                  style={{
                    width: "60%",
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Preparing meta options...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
