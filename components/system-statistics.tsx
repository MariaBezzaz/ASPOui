"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

// Comprehensive system metric descriptions
const systemMetricDescriptions: Record<
  string,
  { fullName: string; description: string; maxValue?: number; isPercentage?: boolean }
> = {
  // Quality Metrics
  MHF: {
    fullName: "Method Hiding Factor",
    description: "Ratio of private methods to total methods in the system",
    maxValue: 1,
    isPercentage: true,
  },
  AHF: {
    fullName: "Attribute Hiding Factor",
    description: "Ratio of private attributes to total attributes in the system",
    maxValue: 1,
    isPercentage: true,
  },
  PF: {
    fullName: "Polymorphism Factor",
    description: "Ratio of overridden methods to total methods",
    maxValue: 1,
    isPercentage: true,
  },
  U: {
    fullName: "Reuse Factor",
    description: "Ratio of reused classes to total classes",
    maxValue: 1,
    isPercentage: true,
  },
  S: {
    fullName: "Specialization Factor",
    description: "Ratio of specialized methods to total methods",
    maxValue: 1,
    isPercentage: true,
  },

  // System Size Metrics
  NOC: {
    fullName: "Number of Classes",
    description: "Total number of classes in the system",
    maxValue: 1000,
  },
  NOI: {
    fullName: "Number of Interfaces",
    description: "Total number of interfaces in the system",
    maxValue: 200,
  },
  NOM: {
    fullName: "Number of Methods",
    description: "Total number of methods in the system",
    maxValue: 10000,
  },
  TLOC: {
    fullName: "Total Lines of Code",
    description: "Total lines of code in the system",
    maxValue: 100000,
  },

  // Complexity Distribution
  lowComplexity: {
    fullName: "Low Complexity Methods",
    description: "Methods with complexity 1-5",
    maxValue: 100,
    isPercentage: true,
  },
  mediumComplexity: {
    fullName: "Medium Complexity Methods",
    description: "Methods with complexity 6-10",
    maxValue: 100,
    isPercentage: true,
  },
  highComplexity: {
    fullName: "High Complexity Methods",
    description: "Methods with complexity 11+",
    maxValue: 100,
    isPercentage: true,
  },

  // Visibility Distribution
  publicMethods: {
    fullName: "Public Methods",
    description: "Percentage of public methods",
    maxValue: 100,
    isPercentage: true,
  },
  privateMethods: {
    fullName: "Private Methods",
    description: "Percentage of private methods",
    maxValue: 100,
    isPercentage: true,
  },
  protectedMethods: {
    fullName: "Protected Methods",
    description: "Percentage of protected methods",
    maxValue: 100,
    isPercentage: true,
  },
}

interface SystemStatisticsProps {
  view: "quality" | "complexity" | "visibility"
  projectData?: any
}

export default function SystemStatistics({ view, projectData }: SystemStatisticsProps) {
  // Extract metrics from project data
  const systemMetrics = projectData?.systemMetrics || {}

  // Get metrics for the current view
  const getMetricsForView = () => {
    switch (view) {
      case "quality":
        return extractQualityMetrics(systemMetrics)
      case "complexity":
        return extractComplexityMetrics(systemMetrics)
      case "visibility":
        return extractVisibilityMetrics(systemMetrics)
      default:
        return []
    }
  }

  const extractQualityMetrics = (metrics: any) => {
    const qualityMetrics = []

    // Ensure metrics is an object
    if (!metrics || typeof metrics !== "object") {
      return []
    }

    // Standard quality metrics
    const standardQualityKeys = ["MHF", "AHF", "PF", "U", "S"]
    standardQualityKeys.forEach((key) => {
      if (metrics[key] !== undefined && typeof metrics[key] === "number") {
        qualityMetrics.push({
          name: key,
          value: metrics[key],
          description: systemMetricDescriptions[key]?.description || `${key} metric`,
          fullName: systemMetricDescriptions[key]?.fullName || key,
          isPercentage: systemMetricDescriptions[key]?.isPercentage || false,
        })
      }
    })

    // Add any other metrics that might be quality-related
    Object.keys(metrics).forEach((key) => {
      if (
        !standardQualityKeys.includes(key) &&
        typeof metrics[key] === "number" &&
        (key.toLowerCase().includes("quality") ||
          key.toLowerCase().includes("factor") ||
          key.toLowerCase().includes("ratio"))
      ) {
        qualityMetrics.push({
          name: key,
          value: metrics[key],
          description: systemMetricDescriptions[key]?.description || `${key} quality metric`,
          fullName: systemMetricDescriptions[key]?.fullName || key,
          isPercentage: typeof metrics[key] === "number" && metrics[key] <= 1,
        })
      }
    })

    return qualityMetrics
  }

  const extractComplexityMetrics = (metrics: any) => {
    const complexityMetrics = []

    // Ensure metrics is an object
    if (!metrics || typeof metrics !== "object") {
      return getDefaultComplexityMetrics()
    }

    // Check for complexity distribution in different formats
    if (metrics.complexity && typeof metrics.complexity === "object") {
      Object.keys(metrics.complexity).forEach((key) => {
        const value = metrics.complexity[key]
        if (typeof value === "number") {
          complexityMetrics.push({
            name: key,
            value: value,
            description: systemMetricDescriptions[key]?.description || `${key} complexity distribution`,
            fullName: systemMetricDescriptions[key]?.fullName || formatMetricName(key),
            isPercentage: true,
          })
        }
      })
    }

    // Look for complexity-related metrics at the top level
    Object.keys(metrics).forEach((key) => {
      if (
        typeof metrics[key] === "number" &&
        (key.toLowerCase().includes("complexity") ||
          key.toLowerCase().includes("wmc") ||
          key.toLowerCase().includes("cc"))
      ) {
        complexityMetrics.push({
          name: key,
          value: metrics[key],
          description: systemMetricDescriptions[key]?.description || `${key} complexity metric`,
          fullName: systemMetricDescriptions[key]?.fullName || formatMetricName(key),
          isPercentage: false,
        })
      }
    })

    // Return default if no complexity metrics found
    return complexityMetrics.length > 0 ? complexityMetrics : getDefaultComplexityMetrics()
  }

  const extractVisibilityMetrics = (metrics: any) => {
    const visibilityMetrics = []

    // Ensure metrics is an object
    if (!metrics || typeof metrics !== "object") {
      return getDefaultVisibilityMetrics()
    }

    // Check for visibility distribution
    if (metrics.visibility && typeof metrics.visibility === "object") {
      Object.keys(metrics.visibility).forEach((key) => {
        const value = metrics.visibility[key]
        if (typeof value === "number") {
          visibilityMetrics.push({
            name: key,
            value: value,
            description: systemMetricDescriptions[key]?.description || `${key} visibility distribution`,
            fullName: systemMetricDescriptions[key]?.fullName || formatMetricName(key),
            isPercentage: true,
          })
        }
      })
    }

    // Look for visibility-related metrics at the top level
    Object.keys(metrics).forEach((key) => {
      if (
        typeof metrics[key] === "number" &&
        (key.toLowerCase().includes("public") ||
          key.toLowerCase().includes("private") ||
          key.toLowerCase().includes("protected") ||
          key.toLowerCase().includes("visibility"))
      ) {
        visibilityMetrics.push({
          name: key,
          value: metrics[key],
          description: systemMetricDescriptions[key]?.description || `${key} visibility metric`,
          fullName: systemMetricDescriptions[key]?.fullName || formatMetricName(key),
          isPercentage: true,
        })
      }
    })

    // Return default if no visibility metrics found
    return visibilityMetrics.length > 0 ? visibilityMetrics : getDefaultVisibilityMetrics()
  }

  // Helper functions for default metrics
  const getDefaultComplexityMetrics = () => [
    {
      name: "Low (1-5)",
      value: 40,
      description: "Methods with complexity 1-5",
      fullName: "Low Complexity",
      isPercentage: true,
    },
    {
      name: "Medium (6-10)",
      value: 30,
      description: "Methods with complexity 6-10",
      fullName: "Medium Complexity",
      isPercentage: true,
    },
    {
      name: "High (11-20)",
      value: 20,
      description: "Methods with complexity 11-20",
      fullName: "High Complexity",
      isPercentage: true,
    },
    {
      name: "Very High (21+)",
      value: 10,
      description: "Methods with complexity 21+",
      fullName: "Very High Complexity",
      isPercentage: true,
    },
  ]

  const getDefaultVisibilityMetrics = () => [
    { name: "Public", value: 56, description: "Public methods", fullName: "Public Methods", isPercentage: true },
    {
      name: "Protected",
      value: 15,
      description: "Protected methods",
      fullName: "Protected Methods",
      isPercentage: true,
    },
    { name: "Private", value: 29, description: "Private methods", fullName: "Private Methods", isPercentage: true },
  ]

  // Helper function to format metric names
  const formatMetricName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const currentMetrics = getMetricsForView()

  const renderMetricCard = (metric: any) => {
    // Ensure metric has required properties
    if (!metric || typeof metric.value !== "number") {
      return null
    }

    const displayValue = metric.isPercentage
      ? `${metric.value.toFixed(1)}%`
      : metric.value % 1 !== 0
        ? metric.value.toFixed(2)
        : metric.value.toString()

    const progressValue = metric.isPercentage
      ? metric.value
      : Math.min(100, (metric.value / (systemMetricDescriptions[metric.name]?.maxValue || 100)) * 100)

    return (
      <div key={metric.name} className="space-y-2">
        <div className="flex items-center gap-1">
          <div className="text-sm font-medium">{metric.fullName || metric.name}</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-muted-foreground">
                  <Info className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{metric.description || "No description available"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-2xl font-bold text-primary">{displayValue}</div>
        <Progress value={Math.max(0, Math.min(100, progressValue))} className="h-2" />
      </div>
    )
  }

  const renderDistributionCard = (metric: any) => {
    // Ensure metric has required properties
    if (!metric || typeof metric.value !== "number") {
      return null
    }

    const percentage = metric.value
    const getColor = () => {
      if (metric.name.toLowerCase().includes("high") || metric.name.toLowerCase().includes("21+")) return "bg-red-500"
      if (metric.name.toLowerCase().includes("medium") || metric.name.toLowerCase().includes("6-10"))
        return "bg-amber-500"
      return "bg-primary"
    }

    return (
      <div key={metric.name} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{metric.fullName || metric.name}</div>
          <div className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</div>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className={`h-2 rounded-full ${getColor()}`}
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          />
        </div>
      </div>
    )
  }

  if (view === "quality") {
    return (
      <Card className="w-full border-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Quality Metrics</CardTitle>
          <CardDescription>Object-oriented quality metrics for the entire codebase</CardDescription>
        </CardHeader>
        <CardContent>
          {currentMetrics.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-5">
              {currentMetrics.map((metric) => renderMetricCard(metric)).filter(Boolean)}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No quality metrics found in the project data.</div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-2 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>{view === "complexity" ? "Complexity Distribution" : "Method Visibility"}</CardTitle>
        <CardDescription>
          {view === "complexity"
            ? "Distribution of methods by cyclomatic complexity"
            : "Distribution of methods by visibility modifier"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentMetrics.length > 0 ? (
          <div className="space-y-6">
            {currentMetrics.map((metric) => renderDistributionCard(metric)).filter(Boolean)}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No {view} metrics found in the project data.</div>
        )}
      </CardContent>
    </Card>
  )
}
