"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, AlertTriangle, CheckCircle, FileCode, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Interface for class data
interface ClassData {
  uid: string
  className: string
  package: string
  metrics: {
    bugProbability: number
    complexity?: number
  }
}

export default function ClassListSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "bugProbability">("bugProbability")
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load project data from localStorage
    try {
      setLoading(true)
      const storedData = localStorage.getItem("projectData")

      if (storedData) {
        const projectData = JSON.parse(storedData)

        if (projectData.classes) {
          // Transform the classes object into an array of ClassData
          const classesArray: ClassData[] = Object.entries(projectData.classes).map(
            ([uid, classData]: [string, any]) => ({
              uid,
              className: classData.name,
              package: classData.package,
              metrics: {
                bugProbability: classData.bugProbability || 0,
                complexity: classData.metrics?.complexity || classData.metrics?.NOM || 0,
              },
            }),
          )

          setClasses(classesArray)
        } else {
          setError("No classes found in the project data")
          setClasses([])
        }
      } else {
        setError("No project data found. Please upload a JSON file.")
        setClasses([])
      }
    } catch (err) {
      console.error("Error loading class data:", err)
      setError("Failed to load class data")
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredClasses = classes
    .filter(
      (cls) =>
        cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.package.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.className.localeCompare(b.className)
      } else {
        return b.metrics.bugProbability - a.metrics.bugProbability
      }
    })

  const handleClassClick = (classUid: string) => {
    router.push(`/dashboard/class/${classUid}`)
  }

  const getBugIndicator = (probability: number) => {
    if (probability >= 0.6) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-red-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>High bug probability: {Math.round(probability * 100)}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    } else if (probability >= 0.3) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-amber-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Medium bug probability: {Math.round(probability * 100)}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    } else {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-green-500">
                <CheckCircle className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Low bug probability: {Math.round(probability * 100)}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-8 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="ml-2 text-xs text-muted-foreground">Loading classes...</span>
        </div>
      ) : error ? (
        <div className="p-3">
          <Alert variant="destructive" className="p-3">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-xs text-muted-foreground">{filteredClasses.length} classes</div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${sortBy === "bugProbability" ? "bg-secondary" : ""}`}
                onClick={() => setSortBy("bugProbability")}
              >
                Risk
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs ${sortBy === "name" ? "bg-secondary" : ""}`}
                onClick={() => setSortBy("name")}
              >
                Name
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-0.5 p-2">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <button
                    key={cls.uid}
                    className={`w-full flex items-center justify-between rounded-md p-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      pathname === `/dashboard/class/${cls.uid}` ? "bg-accent text-accent-foreground" : ""
                    }`}
                    onClick={() => handleClassClick(cls.uid)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCode className="h-4 w-4 shrink-0 text-primary" />
                      <div className="truncate">
                        <div className="font-medium truncate">{cls.className}</div>
                        <div className="text-xs text-muted-foreground truncate">{cls.package}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">{getBugIndicator(cls.metrics.bugProbability)}</div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchTerm ? "No classes match your search" : "No classes found"}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
