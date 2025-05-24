"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

// Comprehensive metric descriptions - dynamically expandable
const metricDescriptions: Record<
  string,
  { fullName: string; description: string; category: string; maxValue?: number; isPercentage?: boolean }
> = {
  // Size Metrics
  NOM: {
    fullName: "Number of Methods",
    description: "Number of methods in a class",
    category: "size",
    maxValue: 50,
  },
  NOA: {
    fullName: "Number of Attributes",
    description: "Number of attributes in a class",
    category: "size",
    maxValue: 30,
  },
  TLOC: {
    fullName: "Total Lines of Code",
    description: "Total lines of code in the class",
    category: "size",
    maxValue: 1000,
  },
  NLOC: {
    fullName: "Non-comment Lines of Code",
    description: "Lines of code excluding comments",
    category: "size",
    maxValue: 800,
  },

  // Coupling Metrics
  MPC: {
    fullName: "Message Passing Coupling",
    description: "Sum of method calls inside all methods",
    category: "coupling",
    maxValue: 100,
  },
  DAC: {
    fullName: "Data Abstraction Coupling",
    description: "Number of fields that refer to other classes defined in the system",
    category: "coupling",
    maxValue: 50,
  },
  EC: {
    fullName: "Efferent Coupling",
    description: "Number of classes that this class depends on",
    category: "coupling",
    maxValue: 30,
  },
  AC: {
    fullName: "Afferent Coupling",
    description: "Number of classes that depend on this class",
    category: "coupling",
    maxValue: 30,
  },
  CBO: {
    fullName: "Coupling Between Objects",
    description: "Number of classes coupled to a given class",
    category: "coupling",
    maxValue: 40,
  },

  // Cohesion Metrics
  LCOM: {
    fullName: "Lack of Cohesion in Methods",
    description: "Number of connected elements in the dependency graph of the class",
    category: "cohesion",
    maxValue: 10,
  },
  LCC: {
    fullName: "Loose Class Cohesion",
    description: "Measures how well the methods of a class are related to each other",
    category: "cohesion",
    maxValue: 1,
    isPercentage: true,
  },
  LCOM4: {
    fullName: "Lack of Cohesion in Methods 4",
    description: "Number of connected components in the class",
    category: "cohesion",
    maxValue: 5,
  },
  TCC: {
    fullName: "Tight Class Cohesion",
    description: "Relative number of directly connected methods",
    category: "cohesion",
    maxValue: 1,
    isPercentage: true,
  },

  // Inheritance Metrics
  DIT: {
    fullName: "Depth of Inheritance Tree",
    description: "Maximum depth of the inheritance tree",
    category: "inheritance",
    maxValue: 10,
  },
  NOC: {
    fullName: "Number of Children",
    description: "Number of immediate subclasses",
    category: "inheritance",
    maxValue: 20,
  },
  RFC: {
    fullName: "Response for Class",
    description: "Number of methods that can be invoked in response to a message",
    category: "inheritance",
    maxValue: 100,
  },

  // Complexity Metrics
  WMC: {
    fullName: "Weighted Methods per Class",
    description: "Sum of complexities of all methods in a class",
    category: "complexity",
    maxValue: 200,
  },
  CC: {
    fullName: "Cyclomatic Complexity",
    description: "Measure of the complexity of a program",
    category: "complexity",
    maxValue: 50,
  },

  // Quality Metrics
  bugProbability: {
    fullName: "Bug Probability",
    description: "Probability that this class contains bugs",
    category: "quality",
    maxValue: 1,
    isPercentage: true,
  },
}

// Dynamic metric categorization
const categorizeMetrics = (metrics: Record<string, any>) => {
  const categories: Record<string, string[]> = {
    size: [],
    coupling: [],
    cohesion: [],
    inheritance: [],
    complexity: [],
    quality: [],
    other: [],
  }

  Object.keys(metrics).forEach((metricKey) => {
    const metricInfo = metricDescriptions[metricKey]
    const category = metricInfo?.category || "other"
    categories[category].push(metricKey)
  })

  // Remove empty categories
  Object.keys(categories).forEach((category) => {
    if (categories[category].length === 0) {
      delete categories[category]
    }
  })

  return categories
}

// Calculate normalized value for progress bar
const calculateNormalizedValue = (metricKey: string, value: number): number => {
  const metricInfo = metricDescriptions[metricKey]

  if (metricInfo?.isPercentage) {
    return value * 100
  }

  if (metricInfo?.maxValue) {
    return Math.min(100, (value / metricInfo.maxValue) * 100)
  }

  // Default normalization for unknown metrics
  if (value <= 1) {
    return value * 100 // Assume it's a percentage
  } else if (value <= 10) {
    return Math.min(100, value * 10) // Scale small values
  } else {
    return Math.min(100, (value / 100) * 100) // Scale larger values
  }
}

interface MetricsDisplayProps {
  classData?: any
}

export default function MetricsDisplay({ classData }: MetricsDisplayProps) {
  const [activeTab, setActiveTab] = useState("size")

  // Default mock data for demonstration when no class data is provided
  const mockClassData = classData || {
    name: "class1",
    package: "pkg",
    type: "CLASS",
    bugProbability: 0.33,
    extends: "none",
    implements: ["Runnable", "Serializable"],
    metrics: {
      NOM: 20,
      NOA: 10,
      MPC: 3,
      DAC: 20,
      LCOM: 1,
      LCC: 2,
    },
  }

  // Dynamically categorize available metrics
  const availableMetrics = mockClassData.metrics || {}
  const categorizedMetrics = categorizeMetrics(availableMetrics)

  // Set the first available category as default if current tab doesn't exist
  const availableCategories = Object.keys(categorizedMetrics)
  if (availableCategories.length > 0 && !availableCategories.includes(activeTab)) {
    setActiveTab(availableCategories[0])
  }

  // Render a metric card
  const renderMetricCard = (metricKey: string) => {
    const metricValue = availableMetrics[metricKey]
    const metricInfo = metricDescriptions[metricKey] || {
      fullName: metricKey.toUpperCase(),
      description: `${metricKey} metric`,
      category: "other",
    }

    if (metricValue === undefined || metricValue === null) return null

    const normalizedValue = calculateNormalizedValue(metricKey, metricValue)
    const displayValue = metricInfo.isPercentage
      ? `${(metricValue * 100).toFixed(1)}%`
      : typeof metricValue === "number" && metricValue % 1 !== 0
        ? metricValue.toFixed(2)
        : metricValue

    return (
      <Card key={metricKey} className="border-2 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-1">
            <CardTitle className="text-base">{metricKey}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground">
                    <Info className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-medium">{metricInfo.fullName}</p>
                  <p className="text-sm mt-1">{metricInfo.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>{metricInfo.fullName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{displayValue}</span>
              {metricInfo.maxValue && <span className="text-sm text-muted-foreground">Max: {metricInfo.maxValue}</span>}
            </div>
            <Progress value={normalizedValue} className="h-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render placeholder card when no metrics are available for a category
  const renderPlaceholderCard = (category: string) => (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">No {category} Metrics</CardTitle>
        <CardDescription>No {category.toLowerCase()} metrics available for this class</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          The uploaded JSON file does not contain any {category.toLowerCase()} metrics for this class.
        </div>
      </CardContent>
    </Card>
  )

  // Capitalize category names for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1) + " Metrics"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Class Metrics</h2>
        <p className="text-muted-foreground">
          Metrics for {mockClassData.name} in package {mockClassData.package}
        </p>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Class Information</CardTitle>
          <CardDescription>Basic information about the class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Package</div>
              <div className="font-medium">{mockClassData.package}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Type</div>
              <div className="font-medium">{mockClassData.type}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Extends</div>
              <div className="font-medium">{mockClassData.extends}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Implements</div>
              <div className="font-medium">{mockClassData.implements?.join(", ") || "None"}</div>
            </div>
            {mockClassData.bugProbability !== undefined && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Bug Probability</div>
                <div className="font-medium">{(mockClassData.bugProbability * 100).toFixed(1)}%</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {availableCategories.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${availableCategories.length}, 1fr)` }}
          >
            {availableCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {formatCategoryName(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          {availableCategories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4 animate-fade-in">
              <div className="grid gap-4 md:grid-cols-2">
                {categorizedMetrics[category].length > 0
                  ? categorizedMetrics[category].map(renderMetricCard)
                  : renderPlaceholderCard(category)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>No Metrics Available</CardTitle>
            <CardDescription>No metrics found for this class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              The uploaded JSON file does not contain any metrics for this class.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
