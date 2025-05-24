"use client"

import dynamic from "next/dynamic"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ZoomIn, ZoomOut, RefreshCw, Download, Filter } from "lucide-react"
// Remove the direct import of Network and DataSet
// import { Network, DataSet, type Options } from "vis-network/standalone"

// Add this after the other imports:
const VisComponent = dynamic(() => import("./vis-network-component").then((mod) => mod.VisNetworkComponent), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 gradient-bg rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-muted-foreground">Loading graph visualization...</p>
      </div>
    </div>
  ),
})

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for demonstration
const mockNodes = [
  { id: "class-uid1", label: "UserService", type: "class", bugProbability: 0.75 },
  { id: "class-uid2", label: "UserRepository", type: "class", bugProbability: 0.12 },
  { id: "class-uid3", label: "UserController", type: "class", bugProbability: 0.32 },
  { id: "class-uid4", label: "User", type: "class", bugProbability: 0.05 },
  { id: "interface-uid1", label: "UserManagement", type: "interface", bugProbability: 0 },
  { id: "interface-uid2", label: "Repository", type: "interface", bugProbability: 0 },
]

const mockEdges = [
  { from: "class-uid1", to: "interface-uid1", label: "implements", type: "implements" },
  { from: "class-uid2", to: "interface-uid2", label: "implements", type: "implements" },
  { from: "class-uid3", to: "class-uid1", label: "uses", type: "uses" },
  { from: "class-uid3", to: "class-uid4", label: "uses", type: "uses" },
  { from: "class-uid1", to: "class-uid2", label: "uses", type: "uses" },
  { from: "class-uid1", to: "class-uid4", label: "uses", type: "uses" },
]

// Mock method data for hover tooltips
const mockMethods = [
  {
    id: "method-1",
    name: "findUserById",
    class: "UserService",
    returnType: "User",
    visibility: "public",
    complexity: 5,
    bugProbability: 0.32,
    parameters: [{ name: "id", type: "Long" }],
    calledBy: ["UserController.getUser"],
    calls: ["UserRepository.findById"],
  },
  {
    id: "method-2",
    name: "saveUser",
    class: "UserService",
    returnType: "User",
    visibility: "public",
    complexity: 8,
    bugProbability: 0.65,
    parameters: [{ name: "user", type: "User" }],
    calledBy: ["UserController.createUser"],
    calls: ["UserRepository.save", "validateUser"],
  },
]

// Add method nodes to the graph
const methodNodes = [
  {
    id: "method-1",
    label: "findUserById",
    type: "method",
    parent: "class-uid1",
    bugProbability: 0.32,
    shape: "dot",
    size: 10,
  },
  {
    id: "method-2",
    label: "saveUser",
    type: "method",
    parent: "class-uid1",
    bugProbability: 0.65,
    shape: "dot",
    size: 10,
  },
]

// Add method edges
const methodEdges = [
  { from: "method-1", to: "class-uid2", label: "calls", type: "method-call" },
  { from: "method-2", to: "method-1", label: "calls", type: "method-call" },
  { from: "class-uid3", to: "method-2", label: "calls", type: "method-call" },
]

export default function GraphView() {
  const router = useRouter()
  const graphRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [filterType, setFilterType] = useState<string>("all")
  const [showClasses, setShowClasses] = useState(true)
  const [showInterfaces, setShowInterfaces] = useState(true)
  const [showHighRisk, setShowHighRisk] = useState(true)
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)
  const [tooltipContent, setTooltipContent] = useState<any>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)

  const visComponentRef = useRef<any>(null)

  // Replace the graph rendering div with this:
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes or interfaces..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="high-risk">High Risk ({">"}60%)</SelectItem>
              <SelectItem value="medium-risk">Medium Risk (30-60%)</SelectItem>
              <SelectItem value="low-risk">Low Risk ({"<"}30%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Show/Hide
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={showClasses} onCheckedChange={setShowClasses}>
              Classes
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showInterfaces} onCheckedChange={setShowInterfaces}>
              Interfaces
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showHighRisk} onCheckedChange={setShowHighRisk}>
              High Risk Nodes
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md border-r"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <div className="flex h-8 w-12 items-center justify-center text-xs">{zoomLevel}%</div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none rounded-r-md" onClick={handleZoomIn}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm relative">
        <VisComponent
          ref={visComponentRef}
          nodes={mockNodes}
          edges={mockEdges}
          methodNodes={methodNodes}
          methodEdges={methodEdges}
          methods={mockMethods}
          filterType={filterType}
          showClasses={showClasses}
          showInterfaces={showInterfaces}
          showHighRisk={showHighRisk}
          searchTerm={searchTerm}
          onNodeClick={(nodeId) => {
            if (nodeId && (nodeId.startsWith("class-") || nodeId.startsWith("interface-"))) {
              router.push(`/dashboard/class/${nodeId}`)
            }
          }}
          onZoomChange={setZoomLevel}
          setTooltipContent={setTooltipContent}
          setTooltipPosition={setTooltipPosition}
          setShowTooltip={setShowTooltip}
        />

        {showTooltip && tooltipContent && (
          <div
            className="absolute bg-background border rounded-md shadow-md p-3 z-10 max-w-xs"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10,
            }}
          >
            <div className="font-medium">
              {tooltipContent.name}({tooltipContent.parameters?.map((p: any) => `${p.type} ${p.name}`).join(", ")}):{" "}
              {tooltipContent.returnType}
            </div>
            <div className="text-xs text-muted-foreground">{tooltipContent.class}</div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                Visibility: <span className="font-medium">{tooltipContent.visibility}</span>
              </div>
              <div>
                Complexity: <span className="font-medium">{tooltipContent.complexity}</span>
              </div>
              <div>
                Bug Risk:
                <span
                  className={`font-medium ${
                    tooltipContent.bugProbability >= 0.6
                      ? "text-red-500"
                      : tooltipContent.bugProbability >= 0.3
                        ? "text-amber-500"
                        : "text-green-500"
                  }`}
                >
                  {Math.round(tooltipContent.bugProbability * 100)}%
                </span>
              </div>
            </div>
            {tooltipContent.calledBy?.length > 0 && (
              <div className="mt-2 text-xs">
                <div className="font-medium">Called by:</div>
                <div className="text-muted-foreground">{tooltipContent.calledBy.join(", ")}</div>
              </div>
            )}
            {tooltipContent.calls?.length > 0 && (
              <div className="mt-2 text-xs">
                <div className="font-medium">Calls:</div>
                <div className="text-muted-foreground">{tooltipContent.calls.join(", ")}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="font-medium mb-3">Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md bg-primary" />
              <span>Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md bg-blue-500" />
              <span>Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Method (Low Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span>Method (Medium Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Method (High Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 bg-blue-500" />
              <span>Implements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 bg-purple-500" />
              <span>Extends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 bg-gray-500" />
              <span>Uses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 bg-green-500" />
              <span>Method Call</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="font-medium mb-3">Graph Information</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Total Classes:</div>
            <div className="font-medium">{mockNodes.filter((n) => n.type === "class").length}</div>
            <div className="text-muted-foreground">Total Interfaces:</div>
            <div className="font-medium">{mockNodes.filter((n) => n.type === "interface").length}</div>
            <div className="text-muted-foreground">Total Methods:</div>
            <div className="font-medium">{mockMethods.length}</div>
            <div className="text-muted-foreground">High Risk Methods:</div>
            <div className="font-medium">{mockMethods.filter((m) => m.bugProbability >= 0.6).length}</div>
            <div className="text-muted-foreground">Total Dependencies:</div>
            <div className="font-medium">{mockEdges.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const handleZoomIn = () => {
  if (visComponentRef.current) {
    visComponentRef.current.zoomIn()
  }
}

const handleZoomOut = () => {
  if (visComponentRef.current) {
    visComponentRef.current.zoomOut()
  }
}

const handleReset = () => {
  if (visComponentRef.current) {
    visComponentRef.current.resetView()
  }
}

const handleDownload = () => {
  if (visComponentRef.current) {
    visComponentRef.current.downloadImage()
  }
}
