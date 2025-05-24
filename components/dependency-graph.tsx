"use client"

import { useRef, useState, useEffect } from "react"
import { ZoomIn, ZoomOut, RefreshCw, Download, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DependencyGraphProps {
  classId: string
  classData?: any
}

export default function DependencyGraph({ classId, classData }: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [network, setNetwork] = useState<any>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [loading, setLoading] = useState(true)

  // Default mock data for demonstration when no class data is provided
  const defaultClassData = {
    name: "class1",
    package: "pkg",
    type: "CLASS",
    bugProbability: 0.33,
    extends: "none",
    implements: ["Runnable", "Serializable"],
    dependencies: {
      method1: [
        {
          with: "Set",
          amount: 1,
        },
        {
          with: "Tokenizer",
          amount: 2,
        },
        {
          with: "@userId",
          amount: 3,
        },
      ],
      method2: [
        {
          with: "this.calculate",
          amount: 1,
        },
        {
          with: "Thread|System|Collectors",
          amount: 1,
        },
        {
          with: "Tokenizer",
          amount: 2,
        },
        {
          with: "@username",
          amount: 2,
        },
      ],
      method3: [
        {
          with: "className",
          amount: 3,
        },
        {
          with: "this.calculate",
          amount: 1,
        },
        {
          with: "@email",
          amount: 1,
        },
      ],
    },
  }

  // Use provided class data or fall back to default mock data
  const selectedClass = classData || defaultClassData

  useEffect(() => {
    if (!containerRef.current) return

    setLoading(true)
    let networkInstance = null

    // Dynamically import vis-network to avoid SSR issues
    const initializeGraph = async () => {
      try {
        // Import vis-network modules
        const visNetwork = await import("vis-network/standalone")
        const visData = await import("vis-data/standalone")

        // Create nodes and edges arrays first
        const nodesArray = []
        const edgesArray = []

        // Track all added node IDs to prevent duplicates
        const addedNodeIds = new Set()

        // Add the class node
        const classNodeId = selectedClass.name
        if (!addedNodeIds.has(classNodeId)) {
          nodesArray.push({
            id: classNodeId,
            label: classNodeId,
            shape: "circle",
            color: {
              background: "#ec4899", // Pink for classes
              border: "#1a1a1a",
            },
            font: { color: "#ffffff", size: 14 },
            size: 35,
          })
          addedNodeIds.add(classNodeId)
        }

        // Add method nodes and their dependencies
        if (selectedClass.dependencies) {
          Object.entries(selectedClass.dependencies).forEach(([methodName, dependencies], methodIndex) => {
            // Add method node if not already added
            if (!addedNodeIds.has(methodName)) {
              nodesArray.push({
                id: methodName,
                label: methodName,
                shape: "box", // Square for methods
                color: {
                  background: "#FFFF00", // Updated to specific yellow
                  border: "#1a1a1a",
                },
                font: { color: "#000000", size: 12 }, // Black text for better contrast with yellow
                size: 25,
              })
              addedNodeIds.add(methodName)
            }

            // Add edge from class to method
            edgesArray.push({
              id: `${classNodeId}-${methodName}`,
              from: classNodeId,
              to: methodName,
              width: 1,
              color: { color: "#6b7280" },
              arrows: "",
            })

            // Add dependency nodes and edges
            ;(dependencies as any[]).forEach((dep: any, depIndex: number) => {
              const depId = dep.with
              let shape = "ellipse"
              let color = "#6b7280" // Default gray
              let isAttribute = false

              // Set shape and color based on dependency type
              if (depId.startsWith("@")) {
                // Attribute dependency
                shape = "hexagon"
                color = "#14b8a6" // Teal for attributes
                isAttribute = true
              } else if (depId === "Tokenizer" || depId === "Set") {
                shape = "diamond"
                color = "#539CFB" // Updated to specific blue
              } else if (depId === "Thread|System|Collectors") {
                shape = "box"
                color = "#ef4444" // Red for Thread|System|Collectors
              } else if (depId.startsWith("this.")) {
                shape = "dot"
                color = "#8b5cf6" // Purple for internal methods
              }

              // Add dependency node if it doesn't already exist
              if (!addedNodeIds.has(depId)) {
                nodesArray.push({
                  id: depId,
                  label: isAttribute ? depId.substring(1) : depId, // Remove @ symbol from attribute labels
                  shape: shape,
                  color: {
                    background: color,
                    border: "#1a1a1a",
                  },
                  font: { color: "#ffffff", size: 10 },
                  size: 20,
                })
                addedNodeIds.add(depId)
              }

              // Add edge from method to dependency with unique ID
              const edgeId = `${methodName}-${depId}-${depIndex}`
              edgesArray.push({
                id: edgeId,
                from: methodName,
                to: depId,
                width: Math.max(1, dep.amount), // Line thickness based on amount
                label: dep.amount.toString(),
                font: { size: 10, color: "#ffffff" }, // Updated to white and bigger
                color: {
                  color: isAttribute ? "#14b8a6" : "#2fd976", // Teal for attributes, green for other dependencies
                },
                arrows: "to",
                dashes: isAttribute ? [2, 2] : false, // Dashed lines for attribute dependencies
              })
            })
          })
        }

        // Now create DataSets from the arrays
        const nodes = new visData.DataSet(nodesArray)
        const edges = new visData.DataSet(edgesArray)

        // Configure options
        const options = {
          nodes: {
            borderWidth: 2,
            shadow: true,
          },
          edges: {
            smooth: {
              type: "continuous",
              roundness: 0.5,
            },
          },
          physics: {
            enabled: true,
            solver: "forceAtlas2Based",
            forceAtlas2Based: {
              gravitationalConstant: -50,
              centralGravity: 0.01,
              springLength: 100,
              springConstant: 0.08,
            },
            stabilization: {
              iterations: 100,
            },
          },
          interaction: {
            zoomView: false, // Disable mouse wheel zoom
            dragView: true,
            hover: true,
            navigationButtons: false,
            keyboard: {
              enabled: false,
            },
          },
        }

        // Destroy previous network if it exists
        if (network) {
          network.destroy()
        }

        // Create network
        networkInstance = new visNetwork.Network(containerRef.current, { nodes, edges }, options)
        setNetwork(networkInstance)

        // Event listeners
        networkInstance.on("zoom", () => {
          const scale = networkInstance.getScale() * 100
          setZoomLevel(Math.round(scale))
        })

        networkInstance.once("stabilizationIterationsDone", () => {
          setLoading(false)
          networkInstance.fit()
          setTimeout(() => {
            if (networkInstance) {
              setZoomLevel(Math.round(networkInstance.getScale() * 100))
            }
          }, 100)
        })
      } catch (error) {
        console.error("Error initializing graph:", error)
        setLoading(false)
      }
    }

    initializeGraph()

    return () => {
      if (networkInstance) {
        networkInstance.destroy()
      }
      setNetwork(null)
    }
  }, [selectedClass])

  const handleZoomIn = () => {
    if (!network || !containerRef.current) return

    try {
      const currentScale = network.getScale()
      const newScale = currentScale * 1.2

      network.moveTo({
        scale: newScale,
        animation: {
          duration: 300,
          easingFunction: "easeInOutQuad",
        },
      })

      // Update zoom level after animation completes
      setTimeout(() => {
        if (network) {
          setZoomLevel(Math.round(network.getScale() * 100))
        }
      }, 300)
    } catch (error) {
      console.error("Error zooming in:", error)
    }
  }

  const handleZoomOut = () => {
    if (!network || !containerRef.current) return

    try {
      const currentScale = network.getScale()
      const newScale = currentScale * 0.8

      network.moveTo({
        scale: newScale,
        animation: {
          duration: 300,
          easingFunction: "easeInOutQuad",
        },
      })

      // Update zoom level after animation completes
      setTimeout(() => {
        if (network) {
          setZoomLevel(Math.round(network.getScale() * 100))
        }
      }, 300)
    } catch (error) {
      console.error("Error zooming out:", error)
    }
  }

  const handleReset = () => {
    if (!network || !containerRef.current) return

    try {
      network.fit({
        animation: {
          duration: 500,
          easingFunction: "easeInOutQuad",
        },
      })

      // Update zoom level after animation completes
      setTimeout(() => {
        if (network) {
          setZoomLevel(Math.round(network.getScale() * 100))
        }
      }, 550)
    } catch (error) {
      console.error("Error resetting view:", error)
    }
  }

  const handleDownload = () => {
    if (!containerRef.current) return

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) return

    // Get network canvas
    const networkCanvas = containerRef.current.querySelector("canvas")
    if (!networkCanvas) return

    // Set canvas dimensions
    canvas.width = networkCanvas.width
    canvas.height = networkCanvas.height

    // Draw network canvas to our canvas
    context.drawImage(networkCanvas, 0, 0)

    // Create download link
    const link = document.createElement("a")
    link.download = `dependency-graph-${selectedClass.name}.png`
    link.href = canvas.toDataURL("image/png")

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Dependency Graph</h3>
          <Badge variant="outline">{selectedClass.name}</Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This graph shows dependencies between methods and external components.</p>
                <ul className="mt-2 list-disc pl-4 text-sm">
                  <li>Pink circles represent classes</li>
                  <li>Yellow squares represent methods</li>
                  <li>Blue diamonds represent Tokenizer and Set</li>
                  <li>Red rectangles represent Thread|System|Collectors</li>
                  <li>Teal hexagons represent class attributes</li>
                  <li>Line thickness indicates dependency strength</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md border-r"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <div className="flex h-8 w-16 items-center justify-center text-xs font-medium">{zoomLevel}%</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-r-md"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset} title="Reset View">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download Image">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Card className="w-full h-[500px] rounded-lg border bg-card text-card-foreground shadow-sm relative p-0 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 mx-auto border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Generating dependency graph...</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </Card>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="font-medium mb-3">Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ec4899]" />
              <span>Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#FFFF00]" />
              <span>Method</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rotate-45 bg-[#539CFB]" />
              <span>Tokenizer/Set</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#ef4444]" />
              <span>Thread|System|Collectors</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 bg-[#14b8a6]"
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
              />
              <span>Attribute</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 bg-[#2fd976]" />
              <span>Method Dependency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 border-t-2 border-dashed border-[#14b8a6]" />
              <span>Attribute Access</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="font-medium mb-3">Class Information</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Class Name:</div>
            <div className="font-medium">{selectedClass.name}</div>
            <div className="text-muted-foreground">Package:</div>
            <div className="font-medium">{selectedClass.package}</div>
            <div className="text-muted-foreground">Methods:</div>
            <div className="font-medium">
              {selectedClass.metrics?.NOM || Object.keys(selectedClass.dependencies || {}).length}
            </div>
            <div className="text-muted-foreground">Attributes:</div>
            <div className="font-medium">{selectedClass.metrics?.NOA || "N/A"}</div>
            <div className="text-muted-foreground">Bug Probability:</div>
            <div className="font-medium text-amber-500">{Math.round(selectedClass.bugProbability * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
