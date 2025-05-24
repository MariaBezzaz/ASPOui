"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

// Comprehensive system metric descriptions with case-insensitive mapping
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
  NSM: {
    fullName: "Number of Static Members",
    description: "Number of static members (attributes methods)",
    maxValue: 1000,
  },

  // The Powerful 6 metrics
  NOA: {
    fullName: "Number of Attributes",
    description: "Number of attributes in a class",
    maxValue: 100,
  },
  MPC: {
    fullName: "Message Passing Coupling",
    description: "Sum of method calls inside all methods",
    maxValue: 100,
  },
  DAC: {
    fullName: "Data Abstraction Coupling",
    description: "Number of fields that refer to other classes defined in the system",
    maxValue: 50,
  },
  LCOM4: {
    fullName: "Lack of Cohesion in Methods 4",
    description: "Number of connected elements in the dependency graph of the class",
    maxValue: 10,
  },
  LCC: {
    fullName: "Loose Class Cohesion",
    description: "Measures how well the methods of a class are related to each other",
    maxValue: 1,
    isPercentage: true,
  },

  // The Other 14 metrics
  DIT: {
    fullName: "Depth of Inheritance Tree",
    description: "Effectively number of parents that led to this class",
    maxValue: 10,
  },
  CBO: {
    fullName: "Coupling Between Objects",
    description: "The number of classes this class is coupled to",
    maxValue: 50,
  },
  NOP: {
    fullName: "Number of Parameters",
    description: "Average number of parameters in a class's methods",
    maxValue: 10,
  },
  NORM: {
    fullName: "Number of Overridden Methods",
    description: "Number of overridden / implemented methods",
    maxValue: 20,
  },
  NOLM: {
    fullName: "Number of Overloaded Methods",
    description: "Number of overloaded methods",
    maxValue: 20,
  },
  MIT: {
    fullName: "Methods Inherited",
    description: "Number of methods inherited overall",
    maxValue: 50,
  },
  CF: {
    fullName: "Coupling Factor",
    description: "Coupling factor metric (check OO Metrics doc for definition)",
    maxValue: 1,
    isPercentage: true,
  },
  DAM: {
    fullName: "Data Access Metric",
    description: "#protectedA + #privateA / #totalA",
    maxValue: 1,
    isPercentage: true,
  },
  ER: {
    fullName: "Exception Ratio",
    description: "#handledE / #thrownE",
    maxValue: 1,
    isPercentage: true,
  },
  SIX: {
    fullName: "Specialization Index",
    description: "DIT * NORM / NOM",
    maxValue: 1,
    isPercentage: true,
  },
  RFC: {
    fullName: "Response for Class",
    description: "Number of methods a class can call, needs adjustments in the parser for 100% accuracy",
    maxValue: 100,
  },

  // Complexity Distribution
  LOWCOMPLEXITY: {
    fullName: "Low Complexity Methods",
    description: "Methods with complexity 1-5",
    maxValue: 100,
    isPercentage: true,
  },
  MEDIUMCOMPLEXITY: {
    fullName: "Medium Complexity Methods",
    description: "Methods with complexity 6-10",
    maxValue: 100,
    isPercentage: true,
  },
  HIGHCOMPLEXITY: {
    fullName: "High Complexity Methods",
    description: "Methods with complexity 11+",
    maxValue: 100,
    isPercentage: true,
  },

  // Visibility Distribution
  PUBLICMETHODS: {
    fullName: "Public Methods",
    description: "Percentage of public methods",
    maxValue: 100,
    isPercentage: true,
  },
  PRIVATEMETHODS: {
    fullName: "Private Methods",
    description: "Percentage of private methods",
    maxValue: 100,
    isPercentage: true,
  },
  PROTECTEDMETHODS: {
    fullName: "Protected Methods",
    description: "Percentage of protected methods",
    maxValue: 100,
    isPercentage: true,
  },
}

// Function to normalize metric keys (case-insensitive)
const normalizeMetricKey = (key: string): string => {
  return key.toUpperCase()
}

// Function to get metric info with case-insensitive lookup
const getSystemMetricInfo = (key: string) => {
  const normalizedKey = normalizeMetricKey(key)
  return (
    systemMetricDescriptions[normalizedKey] || {
      fullName: formatMetricName(key),
      description: `${key} metric`,
      maxValue: 100,
      isPercentage: false,
    }
  )
}

// Helper function to format metric names
const formatMetricName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
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

  // Enhanced quality metrics extraction with case-insensitive handling
  const extractQualityMetrics = (metrics: any) => {
    const qualityMetrics = []

    // Ensure metrics is an object
    if (!metrics || typeof metrics !== "object") {
      return []
    }

    // The Powerful 6 metrics (case-insensitive)
    const powerfulSix = ["NOM", "NOA", "MPC", "DAC", "LCOM4", "LCC"]

    // The Other 14 metrics (case-insensitive)
    const otherFourteen = [
      "DIT",
      "NOC",
      "CBO",
      "TLOC",
      "NSM",
      "NOP",
      "NORM",
      "NOLM",
      "MIT",
      "CF",
      "DAM",
      "ER",
      "PF",
      "SIX",
      "RFC",
    ]

    // Combine all metrics
    const allMetrics = [...powerfulSix, ...otherFourteen]

    // Check for exact matches first, then case-insensitive matches
    Object.keys(metrics).forEach((key) => {
      if (typeof metrics[key] === "number") {
        const normalizedKey = normalizeMetricKey(key)
        if (allMetrics.includes(normalizedKey)) {
          const metricInfo = getSystemMetricInfo(key)
          qualityMetrics.push({
            name: normalizedKey,
            originalKey: key,
            value: metrics[key],
            description: metricInfo.description,
            fullName: metricInfo.fullName,
            aspect: "Quality",
            isPowerfulSix: powerfulSix.includes(normalizedKey),
          })
        }
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
          const metricInfo = getSystemMetricInfo(key)
          complexityMetrics.push({
            name: normalizeMetricKey(key),
            originalKey: key,
            value: value,
            description: metricInfo.description,
            fullName: metricInfo.fullName,
            isPercentage: true,
          })
        }
      })
    }

    // Look for complexity-related metrics at the top level (case-insensitive)
    Object.keys(metrics).forEach((key) => {
      if (
        typeof metrics[key] === "number" &&
        (key.toLowerCase().includes("complexity") ||
          key.toLowerCase().includes("wmc") ||
          key.toLowerCase().includes("cc"))
      ) {
        const metricInfo = getSystemMetricInfo(key)
        complexityMetrics.push({
          name: normalizeMetricKey(key),
          originalKey: key,
          value: metrics[key],
          description: metricInfo.description,
          fullName: metricInfo.fullName,
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
          const metricInfo = getSystemMetricInfo(key)
          visibilityMetrics.push({
            name: normalizeMetricKey(key),
            originalKey: key,
            value: value,
            description: metricInfo.description,
            fullName: metricInfo.fullName,
            isPercentage: true,
          })
        }
      })
    }

    // Look for visibility-related metrics at the top level (case-insensitive)
    Object.keys(metrics).forEach((key) => {
      if (
        typeof metrics[key] === "number" &&
        (key.toLowerCase().includes("public") ||
          key.toLowerCase().includes("private") ||
          key.toLowerCase().includes("protected") ||
          key.toLowerCase().includes("visibility"))
      ) {
        const metricInfo = getSystemMetricInfo(key)
        visibilityMetrics.push({
          name: normalizeMetricKey(key),
          originalKey: key,
          value: metrics[key],
          description: metricInfo.description,
          fullName: metricInfo.fullName,
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

  const currentMetrics = getMetricsForView()

  // Enhanced metric card rendering with hover descriptions
  const renderMetricCard = (metric: any) => {
    // Ensure metric has required properties
    if (!metric || typeof metric.value !== "number") {
      return null
    }

    const displayValue = metric.value % 1 !== 0 ? metric.value.toFixed(2) : metric.value.toString()

    return (
      <TooltipProvider key={metric.name}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-2 p-3 rounded-lg border hover:border-primary/50 transition-all duration-200 cursor-help hover:shadow-md">
              <div className="flex items-center gap-1">
                <div className="text-sm font-medium font-mono flex items-center gap-2">
                  {metric.name}
                  {metric.isPowerfulSix && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Powerful 6</span>
                  )}
                </div>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-primary">{displayValue}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="space-y-1">
              <p className="font-medium">{metric.fullName}</p>
              <p className="text-sm">{metric.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
      <TooltipProvider key={metric.name}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-2 cursor-help">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium flex items-center gap-1">
                  {metric.fullName || metric.name}
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground">{percentage.toFixed(0)}%</div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${getColor()}`}
                  style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="space-y-1">
              <p className="font-medium">{metric.fullName}</p>
              <p className="text-sm">{metric.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Add no-data state for each view
  if (view === "quality") {
    return (
      <Card className="w-full border-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Quality Metrics</CardTitle>
          <CardDescription>
            Object-oriented quality metrics for the entire codebase (hover for descriptions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentMetrics.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-5">
              {currentMetrics.map((metric) => renderMetricCard(metric)).filter(Boolean)}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p>No quality metrics found in the project data.</p>
                <p className="text-sm mt-2">Upload a JSON file with systemMetrics to view quality metrics.</p>
              </div>
            </div>
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
            ? "Distribution of methods by cyclomatic complexity (hover for descriptions)"
            : "Distribution of methods by visibility modifier (hover for descriptions)"}
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
