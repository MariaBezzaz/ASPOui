import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="gradient-bg rounded-full p-3">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
        <h2 className="text-xl font-medium">Loading Dashboard...</h2>
        <p className="text-sm text-muted-foreground">Processing project data</p>
      </div>
    </div>
  )
}
