"use client"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const DRUG_DATABASE = [
  "Atorvastatin", "Amlodipine", "Amoxicillin", "Aspirin", "Azithromycin",
  "Bisoprolol", "Carvedilol", "Clopidogrel", "Doxycycline", "Enalapril",
  "Enoxaparin", "Esomeprazole", "Furosemide", "Gabapentin", "Heparin",
  "Hydrochlorothiazide", "Ibuprofen", "Insulin Glargine", "Lisinopril",
  "Losartan", "Metformin", "Metoprolol", "Morphine", "Omeprazole",
  "Pantoprazole", "Paracetamol", "Prednisolone", "Ramipril", "Rosuvastatin",
  "Salbutamol", "Simvastatin", "Spironolactone", "Tramadol", "Warfarin",
]

interface DrugAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DrugAutocomplete({ value, onChange, placeholder = "Drug name...", className }: DrugAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = inputValue.length >= 1
    ? DRUG_DATABASE.filter(d => d.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          className="w-full pl-7 pr-2 py-1.5 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
          onChange={(e) => {
            setInputValue(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {filtered.map((drug) => {
            const idx = drug.toLowerCase().indexOf(inputValue.toLowerCase())
            return (
              <li key={drug}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setInputValue(drug)
                    onChange(drug)
                    setOpen(false)
                  }}
                >
                  {idx >= 0 ? (
                    <>
                      {drug.slice(0, idx)}
                      <span className="font-semibold text-primary">{drug.slice(idx, idx + inputValue.length)}</span>
                      {drug.slice(idx + inputValue.length)}
                    </>
                  ) : drug}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
