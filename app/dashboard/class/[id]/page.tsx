"use client"

import { useEffect, useState } from "react"
import DependencyGraph from "@/components/dependency-graph"
import MetricsDisplay from "@/components/metrics-display"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  return <ClassDetailPageClient classId={resolvedParams.id} />
}

function ClassDetailPageClient({ classId }: { classId: string }) {
  const [projectData, setProjectData] = useState<any>(null)
  const [classData, setClassData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get project data from localStorage
    try {
      const storedData = localStorage.getItem("projectData")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setProjectData(parsedData)

        // Find the class data for the specified ID
        if (parsedData.classes && classId) {
          // Try to find the class by ID directly or by name
          const classInfo =
            parsedData.classes[classId] ||
            Object.values(parsedData.classes).find(
              (c: any) => c.name === classId || `${c.package}.${c.name}` === classId,
            )

          if (classInfo) {
            setClassData(classInfo)
          } else {
            setError(`Class '${classId}' not found in the project data.`)
          }
        }
      }
    } catch (err) {
      setError("Failed to load project data. Please upload a JSON file again.")
      console.error("Error loading project data:", err)
    }
  }, [classId])

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Class View</h2>
        <p className="text-muted-foreground">
          {classData ? (
            <>
              Detailed information about {classData.name} in package {classData.package}
            </>
          ) : (
            <>Detailed information about the selected class.</>
          )}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {classData ? (
        <>
          <MetricsDisplay classData={classData} />
          <DependencyGraph classId={classId} classData={classData} />
        </>
      ) : !error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 mx-auto border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading class data...</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
