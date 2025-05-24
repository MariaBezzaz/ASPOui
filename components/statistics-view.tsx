"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatisticsViewProps {
  projectData?: any
}

export default function StatisticsView({ projectData }: StatisticsViewProps) {
  // Extract system metrics dynamically
  const systemMetrics = projectData?.systemMetrics || {}

  // Dynamic system overview metrics
  const getSystemOverviewMetrics = () => {
    const metrics = []

    if (!projectData || !projectData.systemMetrics) {
      return []
    }

    // Standard metrics with dynamic extraction
    const standardMetrics = [
      { key: "NOC", label: "Total Classes" },
      { key: "NOI", label: "Total Interfaces" },
      { key: "NOM", label: "Total Methods" },
      { key: "TLOC", label: "Total Lines of Code" },
      { key: "NSM", label: "Total Static Members" },
    ]

    standardMetrics.forEach(({ key, label }) => {
      const value = systemMetrics[key]
      if (typeof value === "number" && !isNaN(value)) {
        metrics.push({
          name: label,
          value: value,
        })
      }
    })

    // Add any additional numeric metrics found in systemMetrics
    if (typeof systemMetrics === "object" && systemMetrics !== null) {
      Object.keys(systemMetrics).forEach((key) => {
        if (
          !["NOC", "NOI", "NOM", "TLOC", "NSM", "quality", "complexity", "visibility"].includes(key) &&
          typeof systemMetrics[key] === "number" &&
          !isNaN(systemMetrics[key])
        ) {
          metrics.push({
            name: formatMetricName(key),
            value: systemMetrics[key],
          })
        }
      })
    }

    return metrics
  }

  // Enhanced bug risk distribution extraction
  const getBugRiskDistribution = () => {
    // Check if quality data exists in the expected format
    if (systemMetrics.quality && typeof systemMetrics.quality === "object") {
      const quality = systemMetrics.quality
      const distribution = []

      // Handle lowRisk, mediumRisk, highRisk with exact structure
      if (quality.lowRisk && typeof quality.lowRisk === "object") {
        distribution.push({
          risk: "Low Risk (<30%)",
          percentage: quality.lowRisk.value || 0,
          count: quality.lowRisk.noc || quality.lowRisk.NOC || 0,
          color: "bg-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
        })
      }

      if (quality.mediumRisk && typeof quality.mediumRisk === "object") {
        distribution.push({
          risk: "Medium Risk (30-60%)",
          percentage: quality.mediumRisk.value || 0,
          count: quality.mediumRisk.noc || quality.mediumRisk.NOC || 0,
          color: "bg-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        })
      }

      if (quality.highRisk && typeof quality.highRisk === "object") {
        distribution.push({
          risk: "High Risk (>60%)",
          percentage: quality.highRisk.value || 0,
          count: quality.highRisk.noc || quality.highRisk.NOC || 0,
          color: "bg-red-500",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
        })
      }

      if (distribution.length > 0) {
        return distribution
      }
    }

    // Return empty array if no valid data found
    return []
  }

  // Helper function to format metric names
  const formatMetricName = (key: string): string => {
    // Convert camelCase or snake_case to readable format
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const systemOverviewMetrics = getSystemOverviewMetrics()
  const bugDistribution = getBugRiskDistribution()

  // Add a no-data state
  if (!projectData) {
    return (
      <div className="w-full space-y-6">
        <Card className="w-full border-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Please upload a JSON file or provide a GitHub link to view system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p>Upload a JSON file containing your project metrics to get started.</p>
                <p className="text-sm mt-2">The JSON should contain systemMetrics and classes data.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Card className="w-full border-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>System Overview</CardTitle>
          <CardDescription>High-level metrics for the entire codebase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {systemOverviewMetrics.slice(0, 4).map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">{metric.name}</div>
                <div className="text-2xl font-bold text-primary">
                  {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* Show additional metrics if available */}
          {systemOverviewMetrics.length > 4 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Additional Metrics</h4>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {systemOverviewMetrics.slice(4).map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">{metric.name}</div>
                    <div className="text-lg font-bold text-primary">
                      {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Bug Risk Distribution */}
      <Card className="w-full border-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Bug Risk Distribution</CardTitle>
          <CardDescription>Distribution of classes by bug probability with detailed breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {bugDistribution && bugDistribution.length > 0 ? (
            <div className="space-y-4">
              {/* Risk Category Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {bugDistribution.map((item, index) => (
                  <Card key={`${item.risk}-${index}`} className={`border-2 ${item.borderColor} ${item.bgColor}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.risk}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Classes</span>
                          <span className="text-2xl font-bold">{item.count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Percentage</span>
                          <span className="text-lg font-semibold">
                            {typeof item.percentage === "number" ? item.percentage.toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${item.color}`}
                            style={{
                              width: `${Math.min(100, Math.max(0, typeof item.percentage === "number" ? item.percentage : 0))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p>No bug risk distribution data available.</p>
                <p className="text-sm mt-2">
                  Upload a JSON file with quality.lowRisk, quality.mediumRisk, and quality.highRisk data.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
