"use client"

import { useEffect, useRef, useState } from "react"
import { GitGraph } from "lucide-react"

// Define props interface
interface VisNetworkComponentProps {
  nodes: any[]
  edges: any[]
  methodNodes: any[]
  methodEdges: any[]
  methods: any[]
  filterType: string
  showClasses: boolean
  showInterfaces: boolean
  showHighRisk: boolean
  searchTerm: string
  onNodeClick?: (nodeId: string) => void
  onZoomChange?: (zoomLevel: number) => void
}

export const VisNetworkComponent = ({
  nodes: mockNodes,
  edges: mockEdges,
  methodNodes,
  methodEdges,
  methods: mockMethods,
  filterType,
  showClasses,
  showInterfaces,
  showHighRisk,
  searchTerm,
  onNodeClick,
  onZoomChange,
}: VisNetworkComponentProps) => {
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

        // Add class and interface nodes
        mockNodes.forEach((node) => {
          const color =
            node.type === "class"
              ? node.bugProbability >= 0.6
                ? "#ef4444"
                : node.bugProbability >= 0.3
                  ? "#f59e0b"
                  : "#8b5cf6"
              : "#3b82f6"

          nodes.add({
            id: node.id,
            label: node.label,
            type: node.type,
            bugProbability: node.bugProbability,
            shape: "box",
            color: {
              background: color,
              border: "#1a1a1a",
              highlight: { background: color, border: "#ffffff" },
            },
            font: { color: "#ffffff" },
            borderWidth: 2,
            shadow: true,
          })
        })

        // Add method nodes
        methodNodes.forEach((node) => {
          const color = node.bugProbability >= 0.6 ? "#ef4444" : node.bugProbability >= 0.3 ? "#f59e0b" : "#8b5cf6"

          nodes.add({
            id: node.id,
            label: node.label,
            type: node.type,
            parent: node.parent,
            bugProbability: node.bugProbability,
            shape: "dot",
            color: {
              background: color,
              border: "#1a1a1a",
              highlight: { background: color, border: "#ffffff" },
            },
            size: 10,
            font: { color: "#ffffff", size: 12 },
            shadow: true,
          })
        })

        // Add edges
        mockEdges.forEach((edge) => {
          let color, dashes

          switch (edge.type) {
            case "implements":
              color = "#3b82f6"
              dashes = false
              break
            case "extends":
              color = "#8b5cf6"
              dashes = false
              break
            case "uses":
              color = "#6b7280"
              dashes = [5, 5]
              break
            default:
              color = "#6b7280"
              dashes = false
          }

          edges.add({
            from: edge.from,
            to: edge.to,
            label: edge.label,
            type: edge.type,
            color: { color, highlight: "#ffffff" },
            width: 2,
            dashes,
            font: { size: 10, color: "#6b7280", align: "middle" },
            arrows: "to",
          })
        })

        // Add method edges
        methodEdges.forEach((edge) => {
          edges.add({
            from: edge.from,
            to: edge.to,
            label: edge.label,
            type: edge.type,
            color: { color: "#10b981", highlight: "#ffffff" },
            width: 1,
            dashes: [2, 2],
            font: { size: 8, color: "#6b7280", align: "middle" },
            arrows: "to",
          })
        })

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
            hierarchicalRepulsion: {
              nodeDistance: 150,
            },
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
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true,
          },
          layout: {
            improvedLayout: true,
          },
        }

        // Create network
        const networkInstance = new visNetwork.Network(graphRef.current, { nodes, edges }, options)
        setNetwork(networkInstance)

        // Event listeners
        networkInstance.on("click", (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0]
            const node = nodes.get(nodeId)

            if (node.type === "class" || node.type === "interface") {
              onNodeClick?.(nodeId)
            }
          }
        })

        networkInstance.on("zoom", () => {
          const scale = networkInstance.getScale() * 100
          onZoomChange?.(Math.round(scale))
        })

        // Apply initial filters
        applyFilters(nodes, filterType, showClasses, showInterfaces, showHighRisk, searchTerm)

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
  }, [])

  // Apply filters when they change
  useEffect(() => {
    if (nodesDataset) {
      applyFilters(nodesDataset, filterType, showClasses, showInterfaces, showHighRisk, searchTerm)
    }
  }, [filterType, showClasses, showInterfaces, showHighRisk, searchTerm, nodesDataset])

  const applyFilters = (
    nodes: any,
    filterType: string,
    showClasses: boolean,
    showInterfaces: boolean,
    showHighRisk: boolean,
    searchTerm: string,
  ) => {
    if (!nodes) return

    const filteredNodes: string[] = []

    // Get all nodes
    const allNodes = [...mockNodes, ...methodNodes]

    for (const node of allNodes) {
      // Filter by type
      if (node.type === "class" && !showClasses) continue
      if (node.type === "interface" && !showInterfaces) continue

      // Filter by risk
      if (node.bugProbability >= 0.6 && !showHighRisk) continue

      // Filter by search term
      if (searchTerm && !node.label.toLowerCase().includes(searchTerm.toLowerCase())) continue

      // Filter by risk level
      if (filterType === "high-risk" && node.bugProbability < 0.6) continue
      if (filterType === "medium-risk" && (node.bugProbability < 0.3 || node.bugProbability >= 0.6)) continue
      if (filterType === "low-risk" && node.bugProbability >= 0.3) continue

      filteredNodes.push(node.id)
    }

    // Update visibility
    try {
      nodes.forEach((node: any) => {
        const isVisible = filteredNodes.includes(node.id)
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
        link.download = "class-relationship-graph.png"
        link.href = canvas.toDataURL("image/png")

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }, [network, onZoomChange])

  if (error) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 gradient-bg rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <GitGraph className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground mb-4">Unable to load graph visualization</p>
          <p className="text-sm text-muted-foreground">
            Showing {mockNodes.length} nodes and {mockEdges.length} edges
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

  return <div ref={graphRef} className="h-[700px]" />
}
