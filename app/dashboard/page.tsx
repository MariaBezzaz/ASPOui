"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StatisticsView from "@/components/statistics-view"
import SystemStatistics from "@/components/system-statistics"
import InheritanceGraph from "@/components/inheritance-graph"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const [projectData, setProjectData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get project data from localStorage
    try {
      const storedData = localStorage.getItem("projectData")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        console.log("Loaded project data:", parsedData) // Debug log
        setProjectData(parsedData)
      }
    } catch (err) {
      setError("Failed to load project data. Please upload a JSON file again.")
      console.error("Error loading project data:", err)
    }
  }, [])

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {projectData ? (
            <>Overview of {projectData.projectName}'s structure, metrics, and relationships.</>
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

      {/* System Statistics Section */}
      <div className="w-full mt-10">
        <h3 className="text-xl font-semibold mb-4">Quality Metrics</h3>
        <Tabs defaultValue="quality" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
            <TabsTrigger value="complexity">Complexity</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>
          <TabsContent value="quality" className="space-y-4 animate-fade-in">
            <SystemStatistics view="quality" projectData={projectData} />
          </TabsContent>
          <TabsContent value="complexity" className="space-y-4 animate-fade-in">
            <SystemStatistics view="complexity" projectData={projectData} />
          </TabsContent>
          <TabsContent value="visibility" className="space-y-4 animate-fade-in">
            <SystemStatistics view="visibility" projectData={projectData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
