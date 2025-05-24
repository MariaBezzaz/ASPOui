"use client"

import Link from "next/link"
import Image from "next/image"
import { GithubIcon, BarChart3, GitGraph, FileCode } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import FileUpload from "@/components/file-upload"
import GithubUrlInput from "@/components/github-url-input"
import { Logo } from "@/components/logo"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export default function Home() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which dashboard image to show based on theme
  const dashboardImage =
    mounted && (theme === "light" || resolvedTheme === "light")
      ? "/images/dashboard-preview-light.png"
      : "/images/dashboard-preview.png"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 font-bold">
            <Logo width={100} height={38} />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/Imaaann/aspo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="gradient-text">Code Analysis</span> Made Simple
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl mx-auto">
                Analyze your Java projects with our tool. Get insights into your code structure, metrics, and
                dependencies.
              </p>
            </div>

            <Card className="w-full max-w-[700px] border-2 shadow-lg">
              <CardContent className="p-8">
                <div className="grid gap-8">
                  <GithubUrlInput />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or upload a JSON file</span>
                    </div>
                  </div>
                  <FileUpload />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 bg-secondary/50 dark:bg-secondary/20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Analysis Tools</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our tool provides comprehensive tools to analyze and visualize your Java codebase
              </p>
            </div>

            <div className="mx-auto grid max-w-[980px] gap-8 md:grid-cols-3">
              <Card className="bg-background/80 backdrop-blur border-2 transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Statistics</h3>
                  <p className="text-muted-foreground">
                    Comprehensive metrics and statistics about your codebase with distribution graphs and outlier
                    detection
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/80 backdrop-blur border-2 transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <GitGraph className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Graph Visualization</h3>
                  <p className="text-muted-foreground">
                    Interactive visual representation of class relationships and dependencies in your project
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/80 backdrop-blur border-2 transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <FileCode className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Class Analysis</h3>
                  <p className="text-muted-foreground">
                    Detailed insights into individual classes, their metrics, and method dependencies
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="mx-auto max-w-[980px] grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Visualize Your Code Structure</h2>
              <p className="text-muted-foreground mb-6">
                Our tool provides intuitive visualizations that help you understand the structure and relationships in
                your codebase.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Interactive class relationship graphs</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Method dependency visualization</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Distribution graphs for all metrics</span>
                </li>
              </ul>
            </div>
            <div className="bg-muted rounded-xl p-4 shadow-lg">
              <div className="aspect-video rounded-lg overflow-hidden bg-card relative">
                {mounted ? (
                  <Image
                    src={dashboardImage || "/placeholder.svg"}
                    alt="Dashboard Preview"
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse bg-muted-foreground/20 w-full h-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/40">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 max-w-md text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Logo width={100} height={38} />
              </div>
              <p className="text-sm text-muted-foreground">
                A powerful code analysis tool for Java projects that provides insights into your codebase structure and
                metrics.
              </p>
            </div>

            <div className="flex items-center">
              <Link
                href="https://github.com/Imaaann/aspo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors px-4 py-2 rounded-md border border-border hover:bg-muted"
              >
                <GithubIcon className="h-5 w-5" />
                GitHub
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
