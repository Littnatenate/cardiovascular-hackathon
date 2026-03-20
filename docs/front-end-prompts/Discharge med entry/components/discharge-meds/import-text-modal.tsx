"use client"

import { useState } from "react"
import { X, FileText, Sparkles } from "lucide-react"

interface ImportTextModalProps {
  onClose: () => void
  onImport: (text: string) => void
}

const SAMPLE_TEXT = `Atorvastatin 40mg 1 tablet once daily at night oral
Metformin 500mg 1 tablet twice daily oral
Amlodipine 5mg 1 tablet once daily oral
Enoxaparin 40mg 1 injection once daily subcutaneous`

export function ImportTextModal({ onClose, onImport }: ImportTextModalProps) {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImport = () => {
    if (!text.trim()) return
    setIsProcessing(true)
    // Simulate AI processing delay
    setTimeout(() => {
      onImport(text)
      setIsProcessing(false)
    }, 800)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-border shadow-xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Import from Text</h2>
              <p className="text-xs text-muted-foreground">Paste a prescription list — AI will parse it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={`Paste your prescription text here…\n\nExample:\n${SAMPLE_TEXT}`}
            className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary resize-none leading-relaxed transition-colors font-mono"
          />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent/50 rounded-md px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>AI will extract drug name, strength, dose, frequency, and route automatically</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!text.trim() || isProcessing}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Parsing…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Parse &amp; Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
