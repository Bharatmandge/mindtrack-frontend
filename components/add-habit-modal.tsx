"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (habit: { name: string; category: string }) => void
}

const categories = ["meditation", "exercise", "reading", "water", "sleep", "journaling", "stretching", "other"]

export function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const [habitName, setHabitName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("meditation")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitName.trim()) return

    setIsSubmitting(true)
    await onAdd({ name: habitName, category: selectedCategory })
    setHabitName("")
    setSelectedCategory("meditation")
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full border border-border/60">
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-lg font-semibold text-foreground">Add New Habit</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habitName">Habit Name</Label>
            <Input
              id="habitName"
              placeholder="e.g., Morning Yoga"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Habit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
