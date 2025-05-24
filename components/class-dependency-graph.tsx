"use client"

import { useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOutIcon, RefreshCwIcon, DownloadIcon, Filter } from "lucide-react"
// Remove the direct import of Network and DataSet
// import { Network, DataSet, type Options } from "vis-network/standalone"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Add these dynamic imports after the other imports:
const VisComponent = dynamic(() => import("./vis-dependency-component").then((mod) => mod.VisDependencyComponent), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 gradient-bg rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <RefreshCwIcon className="h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-muted-foreground">Loading graph visualization...</p>
      </div>
    </div>
  ),
})

// Mock data for demonstration based on the JSON structure
const mockClassData = {
  uid: "class-uid1",
  className: "UserService",
  package: "com.example.service",
  metrics: {
    bugProbability: 0.75,
    NOM: 12,
    NOA: 5,
  },
  inheritance: {
    parent: "class-uid3",
    interfaces: ["interface-uid2", "interface-uid1"],
  },
  attributes: [
    {
      uid: "attr-uid1",
      name: "userRepository",
      type: "UserRepository",
      accessor: "private",
    },
    {
      uid: "attr-uid2",
      name: "authService",
      type: "AuthenticationService",
      accessor: "private",
    },
  ],
  methods: [
    {
      uid: "method-uid1",
      name: "findUserById",
      return: "User",
      accessor: "public",
      bugProbability: 0.32,
    },
    {
      uid: "method-uid2",
      name: "saveUser",
      return: "User",
      accessor: "public",
      bugProbability: 0.65,
    },
    {
      uid: "method-uid3",
      name: "validateUser",
      return: "boolean",
      accessor: "private",
      bugProbability: 0.45,
    },
    {
      uid: "method-uid4",
      name: "formatUserData",
      return: "void",
      accessor: "private",
      bugProbability: 0.25,
    },
  ],
  dependencies: [
    {
      from: "method-uid1",
      to: "external-method-uid1",
      target: "UserRepository.findById",
    },
    {
      from: "method-uid2",
      to: "method-uid3",
    },
    {
      from: "method-uid2",
      to: "method-uid4",
    },
    {
      from: "method-uid2",
      to: "external-method-uid2",
      target: "UserRepository.save",
    },
  ],
}

// Mock related classes
const mockRelatedClasses = [
  {
    uid: "class-uid3",
    className: "BaseService",
    package: "com.example.service",
    relationship: "parent",
  },
  {
    uid: "interface-uid1",
    className: "UserManagement",
    package: "com.example.service.interfaces",
    relationship: "implements",
  },
  {
    uid: "interface-uid2",
    className: "Auditable",
    package: "com.example.common",
    relationship: "implements",
  },
  {
    uid: "class-uid4",
    className: "User",
    package: "com.example.model",
    relationship: "uses",
  },
  {
    uid: "class-uid5",
    className: "UserRepository",
    package: "com.example.repository",
    relationship: "uses",
  },
]

// External methods
const externalMethods = [
  {
    id: "external-method-uid1",
    name: "findById",
    class: "UserRepository",
    bugProbability: 0.15,
  },
  {
    id: "external-method-uid2",
    name: "save",
    class: "UserRepository",
    bugProbability: 0.25,
  },
]

export default function ClassDependencyGraph() {
  const graphRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("dependencies")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showPublicMethods, setShowPublicMethods] = useState(true)
  const [showPrivateMethods, setShowPrivateMethods] = useState(true)
  const [showExternalDeps, setShowExternalDeps] = useState(true)
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)
  const [tooltipContent, setTooltipContent] = useState<any>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)

  const visComponentRef = useRef<any>(null)

  const handleZoomIn = () => {
    const visComponent = document.querySelector("[data-vis-component]")
    if (visComponent && (visComponent as any).zoomIn) {
      ;(visComponent as any).zoomIn()
    }
  }

  const handleZoomOut = () => {
    const visComponent = document.querySelector("[data-vis-component]")
    if (visComponent && (visComponent as any).zoomOut) {
      ;(visComponent as any).zoomOut()
    }
  }

  const handleReset = () => {
    const visComponent = document.querySelector("[data-vis-component]")
    if (visComponent && (visComponent as any).resetView) {
      ;(visComponent as any).resetView()
    }
  }

  const handleDownload = () => {
    const visComponent = document.querySelector("[data-vis-component]")
    if (visComponent && (visComponent as any).downloadImage) {
      ;(visComponent as any).downloadImage()
    }
  }

  return (
    <div className="w-full space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
        }}
        className="w-full"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="inheritance">Inheritance</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem checked={showPublicMethods} onCheckedChange={setShowPublicMethods}>
                  Public Methods
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={showPrivateMethods} onCheckedChange={setShowPrivateMethods}>
                  Private Methods
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={showExternalDeps} onCheckedChange={setShowExternalDeps}>
                  External Dependencies
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center rounded-md border bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none rounded-l-md border-r"
                onClick={handleZoomOut}
              >
                <ZoomOutIcon className="h-3.5 w-3.5" />
              </Button>
              <div className="flex h-8 w-12 items-center justify-center text-xs">{zoomLevel}%</div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none rounded-r-md" onClick={handleZoomIn}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownload}>
              <DownloadIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <TabsContent value="dependencies" className="w-full mt-4 relative">
          <div className="w-full h-[700px] rounded-lg border bg-card text-card-foreground shadow-sm">
            <VisComponent
              activeTab="dependencies"
              classData={mockClassData}
              relatedClasses={mockRelatedClasses}
              externalMethods={externalMethods}
              showPublicMethods={showPublicMethods}
              showPrivateMethods={showPrivateMethods}
              showExternalDeps={showExternalDeps}
              onZoomChange={setZoomLevel}
              onHoverMethod={(method, position) => {
                if (method) {
                  setHoveredMethod(method.uid || method.id)
                  setTooltipContent(method)
                  setTooltipPosition(position)
                  setShowTooltip(true)
                } else {
                  setHoveredMethod(null)
                  setShowTooltip(false)
                }
              }}
            />
          </div>

          {showTooltip && tooltipContent && (
            <div
              className="absolute bg-background border rounded-md shadow-md p-3 z-10 max-w-xs"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y + 10,
              }}
            >
              <div className="font-medium">
                {tooltipContent.label || tooltipContent.name}(): {tooltipContent.returnType || tooltipContent.return}
              </div>
              <div className="text-xs text-muted-foreground">{mockClassData.className}</div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>
                  Visibility: <span className="font-medium">{tooltipContent.accessor}</span>
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="inheritance" className="w-full mt-4 relative">
          <div className="w-full h-[700px] rounded-lg border bg-card text-card-foreground shadow-sm">
            <VisComponent
              activeTab="inheritance"
              classData={mockClassData}
              relatedClasses={mockRelatedClasses}
              externalMethods={externalMethods}
              showPublicMethods={showPublicMethods}
              showPrivateMethods={showPrivateMethods}
              showExternalDeps={showExternalDeps}
              onZoomChange={setZoomLevel}
              onHoverMethod={(method, position) => {
                if (method) {
                  setHoveredMethod(method.uid || method.id)
                  setTooltipContent(method)
                  setTooltipPosition(position)
                  setShowTooltip(true)
                } else {
                  setHoveredMethod(null)
                  setShowTooltip(false)
                }
              }}
            />
          </div>

          {showTooltip && tooltipContent && (
            <div
              className="absolute bg-background border rounded-md shadow-md p-3 z-10 max-w-xs"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y + 10,
              }}
            >
              <div className="font-medium">
                {tooltipContent.label || tooltipContent.name}(): {tooltipContent.returnType || tooltipContent.return}
              </div>
              <div className="text-xs text-muted-foreground">{mockClassData.className}</div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>
                  Visibility: <span className="font-medium">{tooltipContent.accessor}</span>
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
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="font-medium mb-3">Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md bg-primary" />
              <span>Current Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md bg-muted-foreground" />
              <span>Related Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-md bg-blue-500" />
              <span>Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Method (Current)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted-foreground" />
              <span>Method (External)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>High Risk ({">"}60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Low Risk ({"<"}30%)</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="font-medium mb-3">Class Information</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Class Name:</div>
            <div className="font-medium">{mockClassData.className}</div>
            <div className="text-muted-foreground">Package:</div>
            <div className="font-medium">{mockClassData.package}</div>
            <div className="text-muted-foreground">Methods:</div>
            <div className="font-medium">{mockClassData.methods.length}</div>
            <div className="text-muted-foreground">Attributes:</div>
            <div className="font-medium">{mockClassData.attributes.length}</div>
            <div className="text-muted-foreground">Bug Probability:</div>
            <div className="font-medium text-red-500">{Math.round(mockClassData.metrics.bugProbability * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
