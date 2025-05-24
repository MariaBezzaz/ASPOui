"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

// Comprehensive metric descriptions with case-insensitive mapping
const metricDescriptions: Record<string, { fullName: string; description: string; category: string; aspect: string }> =
  {
    // The Powerful 6 - Standard metrics agreed upon by computer scientists
    NOM: {
      fullName: "Number of Methods",
      description: "Number of methods in a class",
      category: "size",
      aspect: "Size",
    },
    NOA: {
      fullName: "Number of Attributes",
      description: "Number of attributes in a class",
      category: "size",
      aspect: "Size",
    },
    MPC: {
      fullName: "Message Passing Coupling",
      description: "Sum of method calls inside all methods",
      category: "coupling",
      aspect: "Coupling",
    },
    DAC: {
      fullName: "Data Abstraction Coupling",
      description: "Number of fields that refer to other classes defined in the system",
      category: "coupling",
      aspect: "Coupling",
    },
    LCOM4: {
      fullName: "Lack of Cohesion in Methods 4",
      description: "Number of connected elements in the dependency graph of the class",
      category: "cohesion",
      aspect: "Cohesion",
    },
    LCC: {
      fullName: "Loose Class Cohesion",
      description: "Measures how well the methods of a class are related to each other",
      category: "cohesion",
      aspect: "Cohesion",
    },

    // The Other 14 metrics
    DIT: {
      fullName: "Depth of Inheritance Tree",
      description: "Effectively number of parents that led to this class",
      category: "inheritance",
      aspect: "Inheritance",
    },
    NOC: {
      fullName: "Number of Children",
      description: "Number of children of this class, NOC' is a recursive version of this metric",
      category: "inheritance",
      aspect: "Inheritance",
    },
    CBO: {
      fullName: "Coupling Between Objects",
      description: "The number of classes this class is coupled to",
      category: "coupling",
      aspect: "Coupling",
    },
    TLOC: {
      fullName: "Total Lines of Code",
      description: "Total lines of code, excluding the whitespace and comments",
      category: "size",
      aspect: "Size",
    },
    NSM: {
      fullName: "Number of Static Members",
      description: "Number of static members (attributes methods)",
      category: "size",
      aspect: "Size",
    },
    NOP: {
      fullName: "Number of Parameters",
      description: "Average number of parameters in a class's methods",
      category: "size",
      aspect: "Size",
    },
    NORM: {
      fullName: "Number of Overridden Methods",
      description: "Number of overridden / implemented methods",
      category: "inheritance",
      aspect: "Inheritance",
    },
    NOLM: {
      fullName: "Number of Overloaded Methods",
      description: "Number of overloaded methods",
      category: "cohesion",
      aspect: "Cohesion",
    },
    MIT: {
      fullName: "Methods Inherited",
      description: "Number of methods inherited overall",
      category: "inheritance",
      aspect: "Inheritance",
    },
    CF: {
      fullName: "Coupling Factor",
      description: "Coupling factor metric (check OO Metrics doc for definition)",
      category: "coupling",
      aspect: "Coupling",
    },
    DAM: {
      fullName: "Data Access Metric",
      description: "#protectedA + #privateA / #totalA",
      category: "encapsulation",
      aspect: "Encapsulation",
    },
    ER: {
      fullName: "Exception Ratio",
      description: "#handledE / #thrownE",
      category: "exception",
      aspect: "Exception",
    },
    PF: {
      fullName: "Polymorphism Factor",
      description: "#Overloaded / #NewMethods * NOC'",
      category: "polymorphism",
      aspect: "Polymorphism",
    },
    SIX: {
      fullName: "Specialization Index",
      description: "DIT * NORM / NOM",
      category: "inheritance",
      aspect: "Inheritance",
    },
    RFC: {
      fullName: "Response for Class",
      description: "Number of methods a class can call, needs adjustments in the parser for 100% accuracy",
      category: "size",
      aspect: "Size",
    },
  }

// Function to normalize metric keys (case-insensitive)
const normalizeMetricKey = (key: string): string => {
  return key.toUpperCase()
}

// Function to get metric info with case-insensitive lookup
const getMetricInfo = (key: string) => {
  const normalizedKey = normalizeMetricKey(key)
  return (
    metricDescriptions[normalizedKey] || {
      fullName: key.toUpperCase(),
      description: `${key} metric`,
      category: "other",
      aspect: "Other",
    }
  )
}

// Dynamic metric categorization with case-insensitive handling
const categorizeMetrics = (metrics: Record<string, any>) => {
  const categories: Record<string, string[]> = {
    size: [],
    coupling: [],
    cohesion: [],
    inheritance: [],
    complexity: [],
    quality: [],
    encapsulation: [],
    exception: [],
    polymorphism: [],
    other: [],
  }

  Object.keys(metrics).forEach((metricKey) => {
    if (metrics[metricKey] !== undefined && metrics[metricKey] !== null) {
      const metricInfo = getMetricInfo(metricKey)
      const category = metricInfo.category || "other"
      categories[category].push(metricKey)
    }
  })

  // Remove empty categories
  Object.keys(categories).forEach((category) => {
    if (categories[category].length === 0) {
      delete categories[category]
    }
  })

  return categories
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

  // Enhanced metric card rendering with hover descriptions
  const renderMetricCard = (metricKey: string) => {
    const metricValue = availableMetrics[metricKey]
    const metricInfo = getMetricInfo(metricKey)

    if (metricValue === undefined || metricValue === null) return null

    const displayValue = typeof metricValue === "number" && metricValue % 1 !== 0 ? metricValue.toFixed(2) : metricValue
    const normalizedKey = normalizeMetricKey(metricKey)

    return (
      <TooltipProvider key={metricKey}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-help hover:border-primary/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1">
                  <CardTitle className="text-base font-mono">{normalizedKey}</CardTitle>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">{displayValue}</span>
                    <span className="text-sm text-muted-foreground">{metricInfo.aspect}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm" side="top">
            <div className="space-y-2">
              <p className="font-medium text-base">{metricInfo.fullName}</p>
              <p className="text-sm">{metricInfo.description}</p>
              <p className="text-xs text-muted-foreground">Category: {metricInfo.aspect}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
        <p className="text-xs text-muted-foreground mt-1">
          Hover over any metric container to see its full name and description
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

      {/* Individual Metric Containers */}
      {availableCategories.length > 0 ? (
        <div className="space-y-6">
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
        </div>
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
