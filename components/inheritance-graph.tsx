"use client"

import { useRef, useState, useEffect } from "react"
import { ZoomIn, ZoomOut, RefreshCw, Download, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Default mock data for demonstration when no project data is provided
const defaultMockData = {
  projectName: "aspoMock",
  inheritance: {
    class1: {
      type: "CLASS",
      list: [
        { name: "class2", type: "extends" },
        { name: "Runnable", type: "implements" },
        { name: "Serializable", type: "implements" },
      ],
    },
    class2: { type: "CLASS", list: [] },
    class3: { type: "CLASS", list: [] },
    class4: {
      type: "CLASS",
      list: [{ name: "class1", type: "extends" }],
    },
    class5: {
      type: "CLASS",
      list: [{ name: "Comparable", type: "implements" }],
    },
    Runnable: { type: "INTERFACE", list: [] },
    Serializable: { type: "INTERFACE", list: [] },
    Comparable: { type: "INTERFACE", list: [] },
  },
}

interface InheritanceGraphProps {
  projectData?: any
}

export default function InheritanceGraph({ projectData }: InheritanceGraphProps) {
  const [zoomLevel, setZoomLevel] = useState(100)
  const networkRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Use provided project data or fall back to default mock data
  const mockData = projectData?.inheritance
    ? { projectName: projectData.projectName || "aspoMock", inheritance: projectData.inheritance }
    : defaultMockData

  // Helper function to highlight inheritance chain
  const highlightInheritanceChain = (nodeId: string, nodesDS: any, edgesDS: any) => {
    try {
      const allNodes = nodesDS.get()
      const allEdges = edgesDS.get()

      // Find all connected nodes (parents and children)
      const connectedNodes = new Set([nodeId])
      const connectedEdges = new Set()

      // Find parents (nodes this node extends/implements)
      allEdges.forEach((edge: any) => {
        if (edge.from === nodeId) {
          connectedNodes.add(edge.to)
          connectedEdges.add(edge.id)
        }
      })

      // Find children (nodes that extend/implement this node)
      allEdges.forEach((edge: any) => {
        if (edge.to === nodeId) {
          connectedNodes.add(edge.from)
          connectedEdges.add(edge.id)
        }
      })

      // Update node styles
      const updatedNodes = allNodes.map((node: any) => {
        if (node.id === nodeId) {
          return {
            ...node,
            borderWidth: 4,
            shadow: { ...node.shadow, size: 15 },
            font: { ...node.font, size: 14 },
          }
        } else if (connectedNodes.has(node.id)) {
          return {
            ...node,
            borderWidth: 3,
            opacity: 1,
          }
        } else {
          return {
            ...node,
            opacity: 0.3,
          }
        }
      })

      // Update edge styles
      const updatedEdges = allEdges.map((edge: any) => {
        if (connectedEdges.has(edge.id)) {
          return {
            ...edge,
            width: edge.width * 1.5,
            opacity: 1,
          }
        } else {
          return {
            ...edge,
            opacity: 0.2,
          }
        }
      })

      nodesDS.update(updatedNodes)
      edgesDS.update(updatedEdges)
    } catch (error) {
      console.error("Error highlighting inheritance chain:", error)
    }
  }

  // Helper function to reset node styles
  const resetNodeStyles = (nodesDS: any, edgesDS: any) => {
    try {
      const allNodes = nodesDS.get()
      const allEdges = edgesDS.get()

      const resetNodes = allNodes.map((node: any) => ({
        ...node,
        borderWidth: 2,
        opacity: 1,
        shadow:
          node.type === "interface"
            ? { enabled: true, color: "rgba(0,0,0,0.3)", size: 5, x: 2, y: 2 }
            : { enabled: true, color: "rgba(0,0,0,0.3)", size: 5, x: 2, y: 2 },
        font: {
          ...node.font,
          size: node.type === "interface" ? 12 : 12,
        },
      }))

      const resetEdges = allEdges.map((edge: any) => ({
        ...edge,
        width: edge.type === "extends" ? 3 : edge.type === "implements" ? 2 : 1,
        opacity: 0.8,
      }))

      nodesDS.update(resetNodes)
      edgesDS.update(resetEdges)
    } catch (error) {
      console.error("Error resetting node styles:", error)
    }
  }

  // Tooltip functions (you can implement these based on your UI preferences)
  const showNodeTooltip = (node: any, position: any) => {
    // Implementation depends on your tooltip system
    console.log(`Showing tooltip for ${node.label} (${node.type})`)
  }

  const hideNodeTooltip = () => {
    // Hide tooltip implementation
  }

  // Process the inheritance data for vis.js
  const processInheritanceData = () => {
    try {
      const nodes: any[] = []
      const edges: any[] = []
      const inheritance = mockData.inheritance

      if (!inheritance || typeof inheritance !== "object") {
        setError("Invalid inheritance data structure")
        return { nodes, edges }
      }

      // Track processed nodes to avoid duplicates
      const processedNodes = new Set()
      const nodeHierarchy = new Map() // Track hierarchy levels

      // First pass: Create all nodes and analyze hierarchy
      Object.entries(inheritance).forEach(([name, details]) => {
        if (processedNodes.has(name)) return

        const isInterface = (details as any).type === "INTERFACE"
        const relationships = (details as any).list || []

        // Calculate initial hierarchy level based on relationships
        let hierarchyLevel = 0
        if (relationships.length > 0) {
          // If this node has parents, it's at least level 1
          hierarchyLevel = 1
        }

        nodes.push({
          id: name,
          label: name,
          type: isInterface ? "interface" : "class",
          shape: isInterface ? "diamond" : "box",
          color: {
            background: isInterface ? "#10b981" : "#ec4899", // Green for interfaces, pink for classes
            border: "#1f2937",
            highlight: {
              background: isInterface ? "#059669" : "#db2777",
              border: "#ffffff",
            },
          },
          font: {
            color: "#ffffff",
            size: 12,
            face: "Inter, Arial, sans-serif",
            bold: true,
          },
          borderWidth: 2,
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.3)",
            size: 5,
            x: 2,
            y: 2,
          },
          size: isInterface ? 25 : 30,
          level: hierarchyLevel,
          relationships: relationships,
          margin: 10,
        })

        nodeHierarchy.set(name, hierarchyLevel)
        processedNodes.add(name)
      })

      // Second pass: Create edges and ensure all referenced nodes exist
      Object.entries(inheritance).forEach(([className, details]) => {
        const relationships = (details as any).list || []

        relationships.forEach((relation: any, index: number) => {
          if (!relation || !relation.name || !relation.type) return

          const targetName = relation.name
          const relationType = relation.type

          // Make sure the target node exists
          if (!processedNodes.has(targetName)) {
            // Create placeholder node for external dependencies
            const isExternalInterface = relationType === "implements"
            nodes.push({
              id: targetName,
              label: targetName,
              type: isExternalInterface ? "interface" : "external",
              shape: isExternalInterface ? "diamond" : "box",
              color: {
                background: "#6b7280", // Gray for external/unknown types
                border: "#374151",
                highlight: { background: "#4b5563", border: "#ffffff" },
              },
              font: {
                color: "#ffffff",
                size: 11,
                face: "Inter, Arial, sans-serif",
                style: "italic",
              },
              borderWidth: 1,
              shadow: {
                enabled: true,
                color: "rgba(0,0,0,0.2)",
                size: 3,
                x: 1,
                y: 1,
              },
              size: 20,
              level: 0, // External nodes at top level
              margin: 8,
            })
            processedNodes.add(targetName)
          }

          const isExtends = relationType === "extends"
          const isImplements = relationType === "implements"

          // Create the edge (child -> parent/interface)
          edges.push({
            id: `${className}-${targetName}-${index}`,
            from: className,
            to: targetName,
            label: relationType,
            type: relationType,
            color: {
              color: isExtends ? "#f59e0b" : isImplements ? "#06b6d4" : "#6b7280",
              highlight: "#ffffff",
              opacity: 0.8,
            },
            width: isExtends ? 3 : isImplements ? 2 : 1,
            length: 200,
            dashes: isImplements ? [8, 4] : false,
            font: {
              size: 10,
              color: "#374151",
              align: "middle",
              background: "rgba(255, 255, 255, 0.8)",
              strokeWidth: 0,
            },
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 1.2,
                type: isExtends ? "arrow" : "triangle",
              },
            },
            smooth: {
              enabled: true,
              type: "continuous",
              roundness: 0.3,
            },
          })
        })
      })

      // Third pass: Recalculate hierarchy levels based on actual relationships
      const calculateHierarchyLevels = () => {
        const levels = new Map()
        const visited = new Set()

        // Find root nodes (nodes with no incoming edges)
        const hasIncoming = new Set()
        edges.forEach((edge) => hasIncoming.add(edge.to))

        const roots = nodes.filter((node) => !hasIncoming.has(node.id))

        // BFS to assign levels
        const queue = roots.map((node) => ({ id: node.id, level: 0 }))

        while (queue.length > 0) {
          const { id, level } = queue.shift()!

          if (visited.has(id)) continue
          visited.add(id)
          levels.set(id, level)

          // Find children
          const children = edges.filter((edge) => edge.to === id).map((edge) => edge.from)
          children.forEach((childId) => {
            if (!visited.has(childId)) {
              queue.push({ id: childId, level: level + 1 })
            }
          })
        }

        return levels
      }

      const hierarchyLevels = calculateHierarchyLevels()

      // Update node levels
      nodes.forEach((node) => {
        node.level = hierarchyLevels.get(node.id) || 0
      })

      setDebugInfo(
        `Processed ${nodes.length} nodes and ${edges.length} edges with ${new Set(nodes.map((n) => n.level)).size} hierarchy levels`,
      )
      return { nodes, edges }
    } catch (err) {
      console.error("Error processing inheritance data:", err)
      setError(`Error processing inheritance data: ${(err as Error).message}`)
      return { nodes: [], edges: [] }
    }
  }

  // Build hierarchical levels for nodes
  const buildHierarchicalLevels = (nodes: any[], edges: any[]) => {
    try {
      // Create a map of node IDs to their level
      const nodeLevels = new Map()

      // Find root nodes (no incoming edges)
      const incomingEdges = new Map()
      edges.forEach((edge) => {
        if (!incomingEdges.has(edge.to)) {
          incomingEdges.set(edge.to, [])
        }
        incomingEdges.get(edge.to).push(edge.from)
      })

      // Nodes with no incoming edges are roots (level 0)
      nodes.forEach((node) => {
        if (!incomingEdges.has(node.id) || incomingEdges.get(node.id).length === 0) {
          nodeLevels.set(node.id, 0)
        }
      })

      // Breadth-first traversal to assign levels
      const queue = [...nodeLevels.keys()]
      const outgoingEdges = new Map()

      edges.forEach((edge) => {
        if (!outgoingEdges.has(edge.from)) {
          outgoingEdges.set(edge.from, [])
        }
        outgoingEdges.get(edge.from).push(edge.to)
      })

      while (queue.length > 0) {
        const nodeId = queue.shift()
        const level = nodeLevels.get(nodeId)

        if (outgoingEdges.has(nodeId)) {
          outgoingEdges.get(nodeId).forEach((childId: string) => {
            const childLevel = nodeLevels.has(childId) ? nodeLevels.get(childId) : level + 1
            nodeLevels.set(childId, Math.max(childLevel, level + 1))
            if (!queue.includes(childId)) {
              queue.push(childId)
            }
          })
        }
      }

      // Update node levels
      return nodes.map((node) => ({
        ...node,
        level: nodeLevels.has(node.id) ? nodeLevels.get(node.id) : node.level || 0,
      }))
    } catch (err) {
      console.error("Error building hierarchical levels:", err)
      setError(`Error building hierarchical levels: ${(err as Error).message}`)
      return nodes
    }
  }

  // Initialize vis-network
  const initNetwork = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!containerRef.current) {
        setError("Container reference is not available")
        setLoading(false)
        return
      }

      // Process data
      const { nodes, edges } = processInheritanceData()

      if (nodes.length === 0) {
        setError("No nodes to display in the inheritance graph")
        setLoading(false)
        return
      }

      // Apply hierarchical levels
      const hierarchicalNodes = buildHierarchicalLevels(nodes, edges)

      // Dynamically import vis-network and vis-data
      const [visNetwork, visData] = await Promise.all([import("vis-network/standalone"), import("vis-data/standalone")])

      // Create datasets
      const nodesDS = new visData.DataSet(hierarchicalNodes)
      const edgesDS = new visData.DataSet(edges)

      // Configure options
      const options = {
        nodes: {
          borderWidth: 2,
          shadow: true,
          font: {
            size: 12,
            face: "Inter, Arial, sans-serif",
          },
          scaling: {
            min: 15,
            max: 50,
            label: {
              enabled: true,
              min: 10,
              max: 20,
            },
          },
          margin: 10,
          chosen: {
            node: (values: any, id: string, selected: boolean, hovering: boolean) => {
              if (selected || hovering) {
                values.borderWidth = 4
                values.shadow = true
                values.shadowSize = 10
              }
            },
          },
        },
        edges: {
          width: 2,
          shadow: true,
          font: {
            size: 10,
            background: "rgba(255, 255, 255, 0.9)",
            strokeWidth: 0,
            align: "middle",
            color: "#374151",
          },
          smooth: {
            enabled: true,
            type: "continuous",
            roundness: 0.3,
          },
          chosen: {
            edge: (values: any, id: string, selected: boolean, hovering: boolean) => {
              if (selected || hovering) {
                values.width = 4
                values.shadow = true
              }
            },
          },
        },
        physics: {
          enabled: true,
          solver: "hierarchicalRepulsion",
          hierarchicalRepulsion: {
            nodeDistance: 180,
            centralGravity: 0.0,
            springLength: 150,
            springConstant: 0.05,
            damping: 0.09,
            avoidOverlap: 1,
          },
          stabilization: {
            iterations: 500,
            updateInterval: 50,
            fit: true,
          },
          adaptiveTimestep: true,
        },
        layout: {
          hierarchical: {
            enabled: true,
            direction: "UD", // Up to down layout
            sortMethod: "directed",
            levelSeparation: 120,
            nodeSpacing: 150,
            treeSpacing: 200,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
          },
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: false,
          hover: true,
          hoverConnectedEdges: true,
          selectConnectedEdges: true,
          multiselect: false,
          navigationButtons: false,
          keyboard: {
            enabled: true,
            speed: { x: 10, y: 10, zoom: 0.02 },
            bindToWindow: false,
          },
          tooltipDelay: 300,
        },
        configure: {
          enabled: false,
        },
      }

      // Destroy previous network if it exists
      if (networkRef.current) {
        networkRef.current.destroy()
      }

      // Create network
      const networkInstance = new visNetwork.Network(containerRef.current, { nodes: nodesDS, edges: edgesDS }, options)

      // Store network in ref
      networkRef.current = networkInstance

      // Set initial zoom level
      setZoomLevel(Math.round(networkInstance.getScale() * 100))

      // Enhanced event listeners
      networkInstance.on("selectNode", (params) => {
        if (params.nodes && params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          highlightInheritanceChain(nodeId, nodesDS, edgesDS)
        }
      })

      networkInstance.on("deselectNode", () => {
        resetNodeStyles(nodesDS, edgesDS)
      })

      networkInstance.on("hoverNode", (params) => {
        const nodeId = params.node
        const node = nodesDS.get(nodeId)
        if (node) {
          showNodeTooltip(node, params.pointer.DOM)
        }
      })

      networkInstance.on("blurNode", () => {
        hideNodeTooltip()
      })

      // Event listeners
      networkInstance.on("zoom", () => {
        setZoomLevel(Math.round(networkInstance.getScale() * 100))
      })

      // Add double-click event to focus on a node
      networkInstance.on("doubleClick", (params) => {
        if (params.nodes && params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          networkInstance.focus(nodeId, {
            scale: 1.2,
            animation: {
              duration: 500,
              easingFunction: "easeInOutQuad",
            },
          })
        }
      })

      // Add click event to select a node
      networkInstance.on("click", (params) => {
        if (params.nodes && params.nodes.length > 0) {
          const nodeId = params.nodes[0]

          // Highlight connected nodes
          const connectedNodes = networkInstance.getConnectedNodes(nodeId)
          const allNodes = nodesDS.get()

          allNodes.forEach((n: any) => {
            if (n.id === nodeId) {
              n.color = {
                ...n.color,
                border: "#ffffff",
                highlight: { background: n.color.background, border: "#ffffff" },
              }
              n.borderWidth = 3
            } else if (connectedNodes.includes(n.id)) {
              n.color = {
                ...n.color,
                border: "#ffffff",
                highlight: { background: n.color.background, border: "#ffffff" },
              }
              n.borderWidth = 2
            } else {
              n.color = {
                ...n.color,
                border: "#1a1a1a",
                highlight: { background: n.color.background, border: "#ffffff" },
              }
              n.borderWidth = 2
            }
          })

          nodesDS.update(allNodes)
        }
      })

      networkInstance.once("stabilizationIterationsDone", () => {
        networkInstance.fit({
          animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad",
          },
        })
        setZoomLevel(Math.round(networkInstance.getScale() * 100))
        setLoading(false)
      })

      // Handle stabilization timeout
      setTimeout(() => {
        if (loading) {
          setLoading(false)
        }
      }, 5000) // 5 second timeout
    } catch (err) {
      console.error("Error initializing vis-network:", err)
      setError(`Failed to initialize graph: ${(err as Error).message}`)
      setLoading(false)
    }
  }

  const handleZoomIn = () => {
    if (!networkRef.current) return

    try {
      const currentScale = networkRef.current.getScale()
      const newScale = currentScale * 1.2

      networkRef.current.moveTo({
        scale: newScale,
        animation: {
          duration: 300,
          easingFunction: "easeInOutQuad",
        },
      })

      // Update zoom level after animation completes
      setTimeout(() => {
        if (networkRef.current) {
          setZoomLevel(Math.round(networkRef.current.getScale() * 100))
        }
      }, 300)
    } catch (error) {
      console.error("Error zooming in:", error)
    }
  }

  const handleZoomOut = () => {
    if (!networkRef.current) return

    try {
      const currentScale = networkRef.current.getScale()
      const newScale = currentScale * 0.8

      networkRef.current.moveTo({
        scale: newScale,
        animation: {
          duration: 300,
          easingFunction: "easeInOutQuad",
        },
      })

      // Update zoom level after animation completes
      setTimeout(() => {
        if (networkRef.current) {
          setZoomLevel(Math.round(networkRef.current.getScale() * 100))
        }
      }, 300)
    } catch (error) {
      console.error("Error zooming out:", error)
    }
  }

  const handleFitGraph = () => {
    if (!networkRef.current) return

    try {
      networkRef.current.fit({
        animation: {
          duration: 500,
          easingFunction: "easeInOutQuad",
        },
      })

      // Update zoom level after animation completes
      setTimeout(() => {
        if (networkRef.current) {
          setZoomLevel(Math.round(networkRef.current.getScale() * 100))
        }
      }, 550)
    } catch (error) {
      console.error("Error fitting graph:", error)
    }
  }

  const handleDownload = () => {
    if (!networkRef.current || !containerRef.current) return

    try {
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
      link.download = "inheritance-graph.png"
      link.href = canvas.toDataURL("image/png")

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  // Initialize the network when the component mounts
  useEffect(() => {
    initNetwork()

    return () => {
      if (networkRef.current) {
        try {
          networkRef.current.destroy()
        } catch (error) {
          console.error("Error destroying network:", error)
        }
        networkRef.current = null
      }
    }
  }, [projectData]) // Only re-initialize when projectData changes

  return (
    <div className="w-full space-y-4 relative">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Inheritance Graph</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This graph shows inheritance relationships between classes and interfaces in the project.</p>
                <ul className="mt-2 list-disc pl-4 text-sm">
                  <li>Pink circles represent classes</li>
                  <li>Green circles represent interfaces</li>
                  <li>Yellow lines represent "extends" relationships</li>
                  <li>Cyan dashed lines represent "implements" relationships</li>
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

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleFitGraph} title="Fit Graph">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download Image">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* {debugInfo && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
          <Info className="h-4 w-4" />
          <AlertTitle>Debug Info</AlertTitle>
          <AlertDescription>{debugInfo}</AlertDescription>
        </Alert>
      )} */}

      <Card className="w-full h-[700px] rounded-lg border bg-card text-card-foreground shadow-sm relative p-0 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 mx-auto border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Generating inheritance graph...</p>
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
              <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
              <span>Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 bg-[#eab308]" />
              <span>Extends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 border-t-2 border-dashed border-[#06b6d4]" />
              <span>Implements</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="font-medium mb-3">Graph Information</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Total Classes:</div>
            <div className="font-medium">
              {Object.values(mockData.inheritance).filter((item) => (item as any).type === "CLASS").length}
            </div>
            <div className="text-muted-foreground">Total Interfaces:</div>
            <div className="font-medium">
              {Object.values(mockData.inheritance).filter((item) => (item as any).type === "INTERFACE").length}
            </div>
            <div className="text-muted-foreground">Project:</div>
            <div className="font-medium">{mockData.projectName}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
