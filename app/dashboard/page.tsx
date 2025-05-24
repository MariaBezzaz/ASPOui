"use client"

import { useEffect, useState } from "react"
import StatisticsView from "@/components/statistics-view"
import SystemStatistics from "@/components/system-statistics"
import InheritanceGraph from "@/components/inheritance-graph"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { FileCode } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [projectData, setProjectData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get project data from localStorage
    try {
      setLoading(true)
      const storedData = localStorage.getItem("projectData")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        console.log("Loaded project data:", parsedData) // Debug log
        setProjectData(parsedData)
      } else {
        // No data available
        setProjectData(null)
      }
    } catch (err) {
      setError("Failed to load project data. Please upload a JSON file again.")
      console.error("Error loading project data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 mx-auto border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!projectData && !error) {
    return (
      <div className="w-full space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Upload a JSON file or provide a GitHub link to view your project metrics.
          </p>
        </div>

        <Card className="w-full border-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>No Project Data</CardTitle>
            <CardDescription>Get started by uploading your project metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="mb-6">
                <FileCode className="h-16 w-16 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                To view your project metrics and visualizations, please upload a JSON file containing your project data
                or provide a GitHub repository link.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/">Upload JSON File</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Analyze GitHub Repo</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {projectData ? (
            <>Overview of {projectData.projectName || "your project"}'s structure, metrics, and relationships.</>
          ) : (
            <>Overview of your project's structure, metrics, and relationships.</>
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

      {/* System Metrics Section */}
      <div className="w-full">
        <h3 className="text-xl font-semibold mb-4">System Metrics</h3>
        <StatisticsView projectData={projectData} />
      </div>

      {/* Class Graph Section */}
      <div className="w-full mt-10">
        <InheritanceGraph projectData={projectData} />
      </div>

      {/* Method Visibility Section */}
      <div className="w-full mt-10">
        <h3 className="text-xl font-semibold mb-4">Method Visibility</h3>
        <div className="w-full space-y-4">
          <SystemStatistics view="visibility" projectData={projectData} />
        </div>
      </div>
    </div>
  )
}
