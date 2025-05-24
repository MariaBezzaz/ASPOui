"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileJson, AlertCircle, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function FileUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [jsonData, setJsonData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateJsonFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`))
        return
      }

      // Check file type
      if (!file.type.includes("json") && !file.name.endsWith(".json")) {
        reject(new Error("Only JSON files are allowed"))
        return
      }

      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const parsedData = JSON.parse(content)

          // Basic validation of required structure
          if (!parsedData.projectName) {
            reject(new Error("Invalid JSON format: Missing 'projectName' field"))
            return
          }

          resolve(parsedData)
        } catch (err) {
          reject(new Error("Invalid JSON format. Please check your file."))
        }
      }

      reader.onerror = () => {
        reject(new Error("Error reading file. Please try again."))
      }

      reader.readAsText(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setUploadSuccess(false)

    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      try {
        setIsLoading(true)
        const parsedData = await validateJsonFile(selectedFile)
        setJsonData(parsedData)
        setUploadSuccess(true)
        setIsLoading(false)
      } catch (err) {
        setError((err as Error).message)
        setFile(null)
        setJsonData(null)
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (jsonData) {
      // Store the JSON data in localStorage for use across the application
      localStorage.setItem("projectData", JSON.stringify(jsonData))
      // Navigate to the dashboard
      router.push("/dashboard")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)
    setUploadSuccess(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)

      try {
        setIsLoading(true)
        const parsedData = await validateJsonFile(droppedFile)
        setJsonData(parsedData)
        setUploadSuccess(true)
        setIsLoading(false)
      } catch (err) {
        setError((err as Error).message)
        setFile(null)
        setJsonData(null)
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadSuccess && (
          <Alert
            variant="default"
            className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400"
          >
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>File uploaded and parsed successfully.</AlertDescription>
          </Alert>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : uploadSuccess
                ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <FileJson className={`h-10 w-10 ${uploadSuccess ? "text-green-500" : "text-muted-foreground"}`} />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag and drop your JSON file here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </div>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Label htmlFor="file" className="cursor-pointer text-sm text-primary hover:underline">
              Browse files
            </Label>
            {file && (
              <p className="text-sm font-medium text-primary mt-2">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>

        {jsonData && (
          <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen} className="w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">JSON Preview</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isPreviewOpen ? "Hide Preview" : "Show Preview"}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-2">
              <div className="rounded-md border">
                <ScrollArea className="h-[300px] w-full rounded-md">
                  <pre className="p-4 text-xs">{JSON.stringify(jsonData, null, 2)}</pre>
                </ScrollArea>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Button type="submit" disabled={!jsonData || isLoading} className="w-full">
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Project
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
