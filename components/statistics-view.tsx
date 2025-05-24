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

    // Standard metrics with fallbacks
    const standardMetrics = [
      { key: "NOC", label: "Total Classes", fallback: 67 },
      { key: "NOI", label: "Total Interfaces", fallback: 23 },
      { key: "NOM", label: "Total Methods", fallback: 812 },
      { key: "TLOC", label: "Total Lines of Code", fallback: 5243 },
    ]

    standardMetrics.forEach(({ key, label, fallback }) => {
      const value = systemMetrics[key]
      metrics.push({
        name: label,
        value: typeof value === "number" && !isNaN(value) ? value : fallback,
      })
    })

    // Add any additional numeric metrics found in systemMetrics
    if (typeof systemMetrics === "object" && systemMetrics !== null) {
      Object.keys(systemMetrics).forEach((key) => {
        if (
          !["NOC", "NOI", "NOM", "TLOC", "quality", "complexity", "visibility"].includes(key) &&
          typeof systemMetrics[key] === "number" &&
          !isNaN(systemMetrics[key]) &&
          systemMetrics[key] > 1
        ) {
          // Exclude ratios/percentages
          metrics.push({
            name: formatMetricName(key),
            value: systemMetrics[key],
          })
        }
      })
    }

    return metrics
  }

  // Dynamic bug risk distribution
  const getBugRiskDistribution = () => {
    // Check if quality data exists in the expected format
    if (systemMetrics.quality && typeof systemMetrics.quality === "object") {
      const quality = systemMetrics.quality
      const distribution = []

      // Handle different possible structures
      if (quality.highRisk !== undefined) {
        distribution.push({
          risk: "High Risk (>60%)",
          percentage: typeof quality.highRisk === "object" ? quality.highRisk.value || 0 : quality.highRisk || 0,
          count: typeof quality.highRisk === "object" ? quality.highRisk.NOC || 0 : 0,
        })
      }

      if (quality.mediumRisk !== undefined) {
        distribution.push({
          risk: "Medium Risk (30-60%)",
          percentage: typeof quality.mediumRisk === "object" ? quality.mediumRisk.value || 0 : quality.mediumRisk || 0,
          count: typeof quality.mediumRisk === "object" ? quality.mediumRisk.NOC || 0 : 0,
        })
      }

      if (quality.lowRisk !== undefined) {
        distribution.push({
          risk: "Low Risk (<30%)",
          percentage: typeof quality.lowRisk === "object" ? quality.lowRisk.value || 0 : quality.lowRisk || 0,
          count: typeof quality.lowRisk === "object" ? quality.lowRisk.NOC || 0 : 0,
        })
      }

      if (distribution.length > 0) {
        return distribution
      }
    }

    // Check for alternative formats
    if (systemMetrics.bugRisk || systemMetrics.riskDistribution) {
      const riskData = systemMetrics.bugRisk || systemMetrics.riskDistribution
      const distribution = []

      if (typeof riskData === "object" && riskData !== null) {
        Object.keys(riskData).forEach((key) => {
          const value = riskData[key]
          if (value !== null && value !== undefined) {
            distribution.push({
              risk: formatRiskLevel(key),
              percentage:
                typeof value === "object"
                  ? value.percentage || value.value || 0
                  : typeof value === "number"
                    ? value
                    : 0,
              count: typeof value === "object" ? value.count || value.NOC || 0 : 0,
            })
          }
        })
      }

      if (distribution.length > 0) {
        return distribution
      }
    }

    // Default fallback
    return [
      { risk: "High Risk (>60%)", percentage: 18, count: 12 },
      { risk: "Medium Risk (30-60%)", percentage: 37, count: 25 },
      { risk: "Low Risk (<30%)", percentage: 45, count: 30 },
    ]
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

  // Helper function to format risk levels
  const formatRiskLevel = (key: string): string => {
    if (key.toLowerCase().includes("high")) return "High Risk (>60%)"
    if (key.toLowerCase().includes("medium")) return "Medium Risk (30-60%)"
    if (key.toLowerCase().includes("low")) return "Low Risk (<30%)"
    return formatMetricName(key)
  }

  const systemOverviewMetrics = getSystemOverviewMetrics()
  const bugDistribution = getBugRiskDistribution()

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

      <Card className="w-full border-2 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Bug Risk Distribution</CardTitle>
          <CardDescription>Distribution of classes by bug probability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {bugDistribution && bugDistribution.length > 0 ? (
              bugDistribution.map((item, index) => (
                <div key={`${item.risk}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{item.risk}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count > 0 ? `${item.count} classes ` : ""}(
                      {typeof item.percentage === "number" ? item.percentage.toFixed(0) : 0}%)
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${
                        item.risk.includes("High")
                          ? "bg-red-500"
                          : item.risk.includes("Medium")
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, typeof item.percentage === "number" ? item.percentage : 0))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No risk distribution data available.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
