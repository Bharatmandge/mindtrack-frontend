"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"
import { useState } from "react"

interface SocialShareProps {
  userName: string
  streak: number
  completionRate: number
}

export function SocialShare({ userName, streak, completionRate }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `I'm on a ${streak}-day wellness streak with ${completionRate}% habit completion on MindTrack! Join me in building better habits. 🎯`
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MindTrack - Wellness Tracker",
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        console.error("Share failed:", err)
      }
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Share Your Progress
        </CardTitle>
        <CardDescription>Inspire others with your wellness journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground italic">"{shareText}"</p>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2 bg-transparent">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          {navigator.share && (
            <Button onClick={handleShare} className="flex-1 gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
