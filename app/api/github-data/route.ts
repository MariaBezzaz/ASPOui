import { type NextRequest, NextResponse } from "next/server"

interface GitHubRequest {
  url: string
}

interface GitHubResponse {
  success: boolean
  data?: any
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GitHubRequest = await request.json()
    const { url } = body

    // Validate GitHub URL format
    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "GitHub URL is required" }, { status: 400 })
    }

    // Basic GitHub URL validation
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/
    if (!githubUrlPattern.test(url.replace(/\/$/, ""))) {
      return NextResponse.json({ success: false, error: "Invalid GitHub repository URL format" }, { status: 400 })
    }

    // Extract owner and repo from URL
    const urlParts = url.replace("https://github.com/", "").replace(/\/$/, "").split("/")
    if (urlParts.length !== 2) {
      return NextResponse.json({ success: false, error: "Invalid GitHub repository URL format" }, { status: 400 })
    }

    const [owner, repo] = urlParts

    // Call backend service to fetch and analyze the repository
    // Replace this with your actual backend endpoint
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080"
    const backendResponse = await fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BACKEND_API_KEY || ""}`,
      },
      body: JSON.stringify({
        owner,
        repo,
        url,
      }),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Backend API error:", errorText)

      if (backendResponse.status === 404) {
        return NextResponse.json({ success: false, error: "Repository not found or not accessible" }, { status: 404 })
      }

      if (backendResponse.status === 403) {
        return NextResponse.json(
          { success: false, error: "Repository access denied. Please check if the repository is public." },
          { status: 403 },
        )
      }

      return NextResponse.json(
        { success: false, error: "Failed to analyze repository. Please try again later." },
        { status: 500 },
      )
    }

    const analysisData = await backendResponse.json()

    // Validate that the response contains the expected data structure
    if (!analysisData || typeof analysisData !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid data received from analysis service" },
        { status: 500 },
      )
    }

    // Return the analysis data in the same format as file upload
    return NextResponse.json({
      success: true,
      data: analysisData,
    })
  } catch (error) {
    console.error("GitHub data fetch error:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { success: false, error: "Unable to connect to analysis service. Please try again later." },
        { status: 503 },
      )
    }

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Request timeout. The repository analysis is taking too long." },
        { status: 408 },
      )
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 })
}
