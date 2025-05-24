"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { GitGraph } from "lucide-react"

// Define props interface
interface VisNetworkGraphProps {
  nodes: any[]
  edges: any[]
  options?: any
  onZoomChange?: (zoomLevel: number) => void
  onNodeClick?: (nodeId: string) => void
}

export const VisNetworkGraph = forwardRef<any, VisNetworkGraphProps>(
  ({ nodes, edges, options = {}, onZoomChange, onNodeClick }, ref) => {
    const graphRef = useRef<HTMLDivElement>(null)
    const [network, setNetwork] = useState<any>(null)
    const [nodesDataset, setNodesDataset] = useState<any>(null)
    const [edgesDataset, setEdgesDataset] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      network,
      zoomIn: () => {
        if (network) {
          const currentScale = network.getScale()
          const newScale = currentScale * 1.2
          network.moveTo({
            scale: newScale,
            animation: {
              duration: 300,
              easingFunction: "easeInOutQuad",
            },
          })
          setTimeout(() => {
            if (network) {
              onZoomChange?.(Math.round(network.getScale() * 100))
            }
          }, 300)
        }
      },
      zoomOut: () => {
        if (network) {
          const currentScale = network.getScale()
          const newScale = currentScale * 0.8
          network.moveTo({
            scale: newScale,
            animation: {
              duration: 300,
              easingFunction: "easeInOutQuad",
            },
          })
          setTimeout(() => {
            if (network) {
              onZoomChange?.(Math.round(network.getScale() * 100))
            }
          }, 300)
        }
      },
      resetView: () => {
        if (network) {
          network.fit({
            animation: {
              duration: 500,
              easingFunction: "easeInOutQuad",
            },
          })
          setTimeout(() => {
            if (network) {
              onZoomChange?.(Math.round(network.getScale() * 100))
            }
          }, 550)
        }
      },
      getScale: () => {
        if (network) {
          return network.getScale()
        }
        return 1
      },
      downloadImage: () => {
        if (!network) return

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
        link.download = "inheritance-graph.png"
        link.href = canvas.toDataURL("image/png")

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      },
    }))

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
          const nodesDS = new visData.DataSet(nodes)
          const edgesDS = new visData.DataSet(edges)

          setNodesDataset(nodesDS)
          setEdgesDataset(edgesDS)

          // Default options
          const defaultOptions = {
            nodes: {
              borderWidth: 2,
              shadow: true,
              font: { size: 14 },
              scaling: {
                min: 10,
                max: 30,
                label: {
                  enabled: true,
                  min: 14,
                  max: 24,
                },
              },
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
              barnesHut: {
                gravitationalConstant: -5000,
                centralGravity: 0.3,
                springLength: 150,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1,
              },
              stabilization: {
                iterations: 250,
                fit: true,
              },
            },
            interaction: {
              hover: true,
              tooltipDelay: 200,
              zoomView: true, // Default to allow zooming
              dragView: true,
              multiselect: true,
              selectable: true,
              navigationButtons: false,
              keyboard: {
                enabled: false,
                bindToWindow: false,
              },
            },
            layout: {
              improvedLayout: true,
              randomSeed: 42, // For consistent layouts
            },
            autoResize: true,
            height: "100%",
            width: "100%",
          }

          // Merge default options with provided options
          const mergedOptions = {
            ...defaultOptions,
            ...options,
            interaction: {
              ...defaultOptions.interaction,
              ...(options.interaction || {}),
            },
            physics: {
              ...defaultOptions.physics,
              ...(options.physics || {}),
            },
          }

          // Create network
          const networkInstance = new visNetwork.Network(
            graphRef.current,
            { nodes: nodesDS, edges: edgesDS },
            mergedOptions,
          )

          setNetwork(networkInstance)

          networkInstance.on("afterDrawing", () => {
            if (isMounted) {
              networkInstance.fit({
                animation: {
                  duration: 1000,
                  easingFunction: "easeInOutQuad",
                },
              })
            }
          })

          // Event listeners
          networkInstance.on("click", (params) => {
            if (params.nodes.length > 0) {
              const nodeId = params.nodes[0]
              onNodeClick?.(nodeId)
            }
          })

          networkInstance.on("zoom", () => {
            if (isMounted) {
              const scale = networkInstance.getScale() * 100
              onZoomChange?.(Math.round(scale))
            }
          })

          networkInstance.on("doubleClick", (params) => {
            if (params.nodes.length > 0) {
              const nodeId = params.nodes[0]
              networkInstance.focus(nodeId, {
                scale: 1.2,
                animation: {
                  duration: 500,
                  easingFunction: "easeInOutQuad",
                },
              })
              onNodeClick?.(nodeId)
            }
          })

          // Stabilize the network
          networkInstance.once("stabilizationIterationsDone", () => {
            setIsLoading(false)
          })

          window.addEventListener("resize", handleResize)
        } catch (err) {
          console.error("Error initializing vis-network:", err)
          setError("Failed to initialize graph visualization")
          setIsLoading(false)
        }
      }

      initializeVis()

      const handleResize = () => {
        if (network) {
          network.redraw()
          network.fit()
        }
      }

      return () => {
        isMounted = false
        window.removeEventListener("resize", handleResize)
        if (network) {
          network.destroy()
        }
      }
    }, [])

    // Update the network when nodes or edges change
    useEffect(() => {
      if (nodesDataset && edgesDataset) {
        try {
          // Update nodes
          const currentNodeIds = new Set(nodesDataset.getIds())
          const newNodeIds = new Set(nodes.map((node) => node.id))

          // Remove nodes that are no longer present
          const nodesToRemove = [...currentNodeIds].filter((id) => !newNodeIds.has(id))
          if (nodesToRemove.length > 0) {
            nodesDataset.remove(nodesToRemove)
          }

          // Update or add nodes
          nodesDataset.update(nodes)

          // Update edges
          const currentEdgeIds = new Set(edgesDataset.getIds())
          const newEdgeIds = new Set(edges.map((edge, i) => edge.id || `${edge.from}-${edge.to}-${i}`))

          // Remove edges that are no longer present
          const edgesToRemove = [...currentEdgeIds].filter((id) => !newEdgeIds.has(id))
          if (edgesToRemove.length > 0) {
            edgesDataset.remove(edgesToRemove)
          }

          // Update or add edges
          edgesDataset.update(
            edges.map((edge, i) => ({
              ...edge,
              id: edge.id || `${edge.from}-${edge.to}-${i}`,
            })),
          )

          // Fit the network to view all nodes
          if (network) {
            network.fit()
          }
        } catch (error) {
          console.error("Error updating network:", error)
        }
      }
    }, [nodes, edges, nodesDataset, edgesDataset, network])

    if (error) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6 gradient-bg rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <GitGraph className="h-8 w-8 text-white" />
            </div>
            <p className="text-muted-foreground mb-4">Unable to load graph visualization</p>
            <p className="text-sm text-muted-foreground">
              {nodes.length} nodes and {edges.length} edges could not be displayed
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="relative h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <div className="mb-6 gradient-bg rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground">Generating graph...</p>
            </div>
          </div>
        )}
        <div
          ref={graphRef}
          className="h-full w-full"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </div>
    )
  },
)

VisNetworkGraph.displayName = "VisNetworkGraph"

export default VisNetworkGraph
