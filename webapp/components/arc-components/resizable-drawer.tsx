"use client"

import * as React from "react"
import { X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ResizableDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  initialHeight?: number
  minHeight?: number
  maxHeight?: number
}

export function ResizableDrawer({
  open,
  onOpenChange,
  children,
  title,
  initialHeight = 300,
  minHeight = 200,
  maxHeight = window.innerHeight * 0.9,
}: ResizableDrawerProps) {
  const [height, setHeight] = React.useState(initialHeight)
  const [isDragging, setIsDragging] = React.useState(false)
  const [startY, setStartY] = React.useState(0)
  const [startHeight, setStartHeight] = React.useState(0)
  const drawerRef = React.useRef<HTMLDivElement>(null)

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.clientY)
    setStartHeight(height)
  }

  // Handle resize during drag
  React.useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (isDragging) {
        const deltaY = startY - e.clientY
        const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight)
        setHeight(newHeight)
      }
    }

    const handleResizeEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleResize)
      document.addEventListener("mouseup", handleResizeEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handleResize)
      document.removeEventListener("mouseup", handleResizeEnd)
    }
  }, [isDragging, startY, startHeight, minHeight, maxHeight])

  // Close drawer when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background"
        style={{ height: `${height}px` }}
        ref={drawerRef}
      >
        {/* Resize handle at top */}
        <div 
          className="absolute top-0 left-0 right-0 h-2 bg-muted cursor-ns-resize flex items-center justify-center -translate-y-full"
          onMouseDown={handleResizeStart}
        >
          <div className="w-16 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg">{title || "Table View"}</h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
