"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Github, ArrowRight, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GithubUrlInput() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/github-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to analyze repository")
        setIsLoading(false)
        return
      }

      // Store the fetched data in localStorage (same as file upload)
      localStorage.setItem("projectData", JSON.stringify(result.data))

      // Navigate to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error analyzing repository:", error)
      setError("Network error. Please check your connection and try again.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="grid gap-4">
        <div className="text-center mb-2">
          <Label htmlFor="github-url" className="text-base font-medium">
            GitHub Repository URL
          </Label>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Github className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="github-url"
              placeholder="https://github.com/username/repository"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null) // Clear error when user types
              }}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={!url || isLoading} className="shrink-0 min-w-24">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Enter a public GitHub repository URL to analyze its code structure and metrics.
        </p>
      </div>
    </form>
  )
}
