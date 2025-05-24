"use client"

import { useEffect, useRef, useState } from "react"
import { GitGraph } from "lucide-react"

// Define props interface
interface VisDependencyComponentProps {
  activeTab: "dependencies" | "inheritance"
  classData: any
  relatedClasses: any[]
  externalMethods: any[]
  showPublicMethods: boolean
  showPrivateMethods: boolean
  showExternalDeps: boolean
  onZoomChange?: (zoomLevel: number) => void
  onHoverMethod?: (method: any | null, position: { x: number; y: number }) => void
}

export const VisDependencyComponent = ({
  activeTab,
  classData,
  relatedClasses,
  externalMethods,
  showPublicMethods,
  showPrivateMethods,
  showExternalDeps,
  onZoomChange,
  onHoverMethod,
}: VisDependencyComponentProps) => {
  const graphRef = useRef<HTMLDivElement>(null)
  const [network, setNetwork] = useState<any>(null)
  const [nodesDataset, setNodesDataset] = useState<any>(null)
  const [edgesDataset, setEdgesDataset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize the network
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    const initializeVis = async () => {
      try {
        // Dynamically import vis-network and vis-data
        const visNetwork = await import("vis-network/standalone")
        const visData = await import("vis-data/standalone")

        if (!isMounted || !graphRef.current) return

        // Create datasets
        const nodes = new visData.DataSet([])
        const edges = new visData.DataSet([])

        setNodesDataset(nodes)
        setEdgesDataset(edges)

        // Configure options
        const options = {
          nodes: {
            borderWidth: 2,
            shadow: true,
            font: { size: 14 },
          },
          edges: {
            width: 2,
            shadow: true,
            smooth: {
              type: "continuous",
              roundness: 0.5,
            },
          },
          physics: {
            enabled: true,
            solver: activeTab === "dependencies" ? "forceAtlas2Based" : "hierarchicalRepulsion",
            forceAtlas2Based: {
              gravitationalConstant: -50,
              centralGravity: 0.01,
              springLength: 100,
              springConstant: 0.08,
            },
            hierarchicalRepulsion: {
              nodeDistance: 150,
            },
            stabilization: {
              iterations: 100,
            },
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true,
          },
          layout: {
            improvedLayout: true,
            hierarchical:
              activeTab === "inheritance"
                ? {
                    direction: "UD",
                    sortMethod: "directed",
                    levelSeparation: 150,
                  }
                : false,
          },
        }

        // Create network
        const networkInstance = new visNetwork.Network(graphRef.current, { nodes, edges }, options)
        setNetwork(networkInstance)

        // Render the appropriate graph
        if (activeTab === "dependencies") {
          renderDependencyGraph(nodes, edges)
        } else {
          renderInheritanceGraph(nodes, edges)
        }

        // Event listeners
        networkInstance.on("hoverNode", (params) => {
          const nodeId = params.node
          const node = nodes.get(nodeId)

          if (node && (node.type === "method" || node.type === "external-method")) {
            const position = networkInstance.getPositions([nodeId])[nodeId]
            const canvasPosition = networkInstance.canvasToDOM(position)
            onHoverMethod?.(node, { x: canvasPosition.x, y: canvasPosition.y })
          }
        })

        networkInstance.on("blurNode", () => {
          onHoverMethod?.(null, { x: 0, y: 0 })
        })

        networkInstance.on("zoom", () => {
          const scale = networkInstance.getScale() * 100
          onZoomChange?.(Math.round(scale))
        })

        // Apply initial filters
        applyFilters(nodes)

        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing vis-network:", err)
        setError("Failed to initialize graph visualization")
        setIsLoading(false)
      }
    }

    initializeVis()

    return () => {
      isMounted = false
      if (network) {
        network.destroy()
      }
    }
  }, [activeTab])

  // Apply filters when they change
  useEffect(() => {
    if (nodesDataset) {
      applyFilters(nodesDataset)
    }
  }, [showPublicMethods, showPrivateMethods, showExternalDeps, nodesDataset])

  const renderDependencyGraph = (nodes: any, edges: any) => {
    if (!nodes || !edges) return

    // Add main class node
    nodes.add({
      id: classData.uid,
      label: classData.className,
      type: "class",
      shape: "box",
      color: {
        background: "#8b5cf6",
        border: "#1a1a1a",
        highlight: { background: "#8b5cf6", border: "#ffffff" },
      },
      font: { color: "#ffffff" },
      borderWidth: 2,
      shadow: true,
      level: 0,
    })

    // Add method nodes
    classData.methods.forEach((method: any) => {
      const color = method.bugProbability >= 0.6 ? "#ef4444" : method.bugProbability >= 0.3 ? "#f59e0b" : "#8b5cf6"

      nodes.add({
        id: method.uid,
        label: method.name,
        type: "method",
        accessor: method.accessor,
        returnType: method.return,
        bugProbability: method.bugProbability,
        shape: "dot",
        color: {
          background: color,
          border: "#1a1a1a",
          highlight: { background: color, border: "#ffffff" },
        },
        size: 10,
        font: { color: "#ffffff", size: 12 },
        shadow: true,
        level: 1,
      })

      // Add edge from class to method
      edges.add({
        from: classData.uid,
        to: method.uid,
        arrows: "",
        color: { color: "#6b7280", highlight: "#ffffff" },
        width: 1,
        dashes: [2, 2],
      })
    })

    // Add external method nodes
    externalMethods.forEach((method: any) => {
      const color = method.bugProbability >= 0.6 ? "#ef4444" : method.bugProbability >= 0.3 ? "#f59e0b" : "#6b7280"

      nodes.add({
        id: method.id,
        label: `${method.class}.${method.name}`,
        type: "external-method",
        bugProbability: method.bugProbability,
        shape: "dot",
        color: {
          background: color,
          border: "#1a1a1a",
          highlight: { background: color, border: "#ffffff" },
        },
        size: 8,
        font: { color: "#6b7280", size: 10 },
        shadow: true,
        level: 2,
      })
    })

    // Add dependency edges
    classData.dependencies.forEach((dep: any) => {
      edges.add({
        from: dep.from,
        to: dep.to,
        label: "calls",
        color: { color: "#10b981", highlight: "#ffffff" },
        width: 1,
        font: { size: 8, color: "#6b7280", align: "middle" },
        arrows: "to",
      })
    })
  }

  const renderInheritanceGraph = (nodes: any, edges: any) => {
    if (!nodes || !edges) return

    // Add main class node
    nodes.add({
      id: classData.uid,
      label: classData.className,
      type: "class",
      shape: "box",
      color: {
        background: "#8b5cf6",
        border: "#1a1a1a",
        highlight: { background: "#8b5cf6", border: "#ffffff" },
      },
      font: { color: "#ffffff" },
      borderWidth: 2,
      shadow: true,
      level: 1,
    })

    // Add parent class
    if (classData.inheritance.parent) {
      const parentClass = relatedClasses.find((c) => c.uid === classData.inheritance.parent)
      if (parentClass) {
        nodes.add({
          id: parentClass.uid,
          label: parentClass.className,
          type: "class",
          shape: "box",
          color: {
            background: "#6b7280",
            border: "#1a1a1a",
            highlight: { background: "#6b7280", border: "#ffffff" },
          },
          font: { color: "#ffffff" },
          borderWidth: 2,
          shadow: true,
          level: 0,
        })

        // Add extends edge
        edges.add({
          from: classData.uid,
          to: parentClass.uid,
          label: "extends",
          color: { color: "#8b5cf6", highlight: "#ffffff" },
          width: 2,
          font: { size: 10, color: "#6b7280", align: "middle" },
          arrows: "to",
        })
      }
    }

    // Add interfaces
    classData.inheritance.interfaces.forEach((interfaceId: string) => {
      const interfaceNode = relatedClasses.find((c) => c.uid === interfaceId)
      if (interfaceNode) {
        nodes.add({
          id: interfaceNode.uid,
          label: interfaceNode.className,
          type: "interface",
          shape: "box",
          color: {
            background: "#3b82f6",
            border: "#1a1a1a",
            highlight: { background: "#3b82f6", border: "#ffffff" },
          },
          font: { color: "#ffffff" },
          borderWidth: 2,
          shadow: true,
          level: 0,
        })

        // Add implements edge
        edges.add({
          from: classData.uid,
          to: interfaceNode.uid,
          label: "implements",
          color: { color: "#3b82f6", highlight: "#ffffff" },
          width: 2,
          font: { size: 10, color: "#6b7280", align: "middle" },
          arrows: "to",
        })
      }
    })

    // Add related classes (uses)
    relatedClasses
      .filter((c) => c.relationship === "uses")
      .forEach((relatedClass) => {
        nodes.add({
          id: relatedClass.uid,
          label: relatedClass.className,
          type: "class",
          shape: "box",
          color: {
            background: "#6b7280",
            border: "#1a1a1a",
            highlight: { background: "#6b7280", border: "#ffffff" },
          },
          font: { color: "#ffffff" },
          borderWidth: 2,
          shadow: true,
          level: 2,
        })

        // Add uses edge
        edges.add({
          from: classData.uid,
          to: relatedClass.uid,
          label: "uses",
          color: { color: "#6b7280", highlight: "#ffffff" },
          width: 2,
          dashes: [5, 5],
          font: { size: 10, color: "#6b7280", align: "middle" },
          arrows: "to",
        })
      })
  }

  const applyFilters = (nodes: any) => {
    if (!nodes) return

    try {
      nodes.forEach((node: any) => {
        let isVisible = true

        if (node.type === "method") {
          // Filter by accessor (public/private)
          if (node.accessor === "public" && !showPublicMethods) {
            isVisible = false
          }
          if (node.accessor === "private" && !showPrivateMethods) {
            isVisible = false
          }
        }

        if (node.type === "external-method" && !showExternalDeps) {
          isVisible = false
        }

        nodes.update({ id: node.id, hidden: !isVisible })
      })
    } catch (error) {
      console.error("Error applying filters:", error)
    }
  }

  // Expose methods for parent component
  useEffect(() => {
    if (!network) return

    // Add methods to the ref
    if (graphRef.current) {
      graphRef.current.setAttribute("data-vis-component", "true")
      ;(graphRef.current as any).zoomIn = () => {
        network.zoomIn(0.2)
        onZoomChange?.(Math.round(network.getScale() * 100))
      }
      ;(graphRef.current as any).zoomOut = () => {
        network.zoomOut(0.2)
        onZoomChange?.(Math.round(network.getScale() * 100))
      }
      ;(graphRef.current as any).resetView = () => {
        network.fit()
        onZoomChange?.(Math.round(network.getScale() * 100))
      }
      ;(graphRef.current as any).downloadImage = () => {
        // Create a canvas element
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (!context) return

        // Get network canvas
        const networkCanvas = graphRef.current?.querySelector("canvas")
        if (!networkCanvas) return

        // Set canvas dimensions
        canvas.width = networkCanvas.width
        canvas.height = networkCanvas.height

        // Draw network canvas to our canvas
        context.drawImage(networkCanvas, 0, 0)

        // Create download link
        const link = document.createElement("a")
        link.download = `class-${activeTab}-graph.png`
        link.href = canvas.toDataURL("image/png")

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }, [network, activeTab, onZoomChange])

  if (error) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 gradient-bg rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <GitGraph className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground mb-4">Unable to load graph visualization</p>
          <p className="text-sm text-muted-foreground">
            {activeTab === "dependencies"
              ? "Class dependency graph would be shown here"
              : "Inheritance graph would be shown here"}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 gradient-bg rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading graph visualization...</p>
        </div>
      </div>
    )
  }

  return <div ref={graphRef} data-vis-component="true" className="h-[700px]" />
}
