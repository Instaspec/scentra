"use client"

import type React from "react"

import { useState } from "react"
import { Send, Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"

type Message = {
  role: "user" | "assistant"
  content: string
}

type Request = {
  id: string
  name: string
  status: "pending" | "sent" | "completed"
  date: string
  description?: string
}

export default function RequestPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! Please describe the fragrance you're looking for in as much detail as possible.",
    },
  ])
  const [standardizedRequest, setStandardizedRequest] = useState<string | null>(null)
  const [currentObjectDescription, setCurrentObjectDescription] = useState<string | null>(null)
  const [selectedRequestId, setSelectedRequestId] = useState<string>("1")
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      name: "Summer Breeze",
      status: "sent",
      date: "2025-03-15",
      description:
        "Fresh citrus-based fragrance with medium intensity, long-lasting profile. Primary notes: bergamot, lemon, light floral undertones. Avoid: heavy musk, overly sweet components.",
    },
    {
      id: "2",
      name: "Ocean Mist",
      status: "completed",
      date: "2025-03-10",
      description:
        "Marine-inspired scent with aquatic notes, medium-light intensity. Primary notes: sea salt, cucumber, light musk. Avoid: heavy florals, spicy components.",
    },
    {
      id: "3",
      name: "Citrus Burst",
      status: "pending",
      date: "2025-03-20",
    },
  ])

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")

    // Simulate chatbot response and update object description
    setTimeout(() => {
      let botResponse = ""

      if (newMessages.length === 2) {
        botResponse = "Could you tell me more about the intensity and longevity you're looking for?"
        setCurrentObjectDescription("Fresh, citrusy scent reminiscent of summer mornings. Not overpowering.")
      } else if (newMessages.length === 4) {
        botResponse = "What specific notes or ingredients would you like to include or avoid?"
        setCurrentObjectDescription("Fresh, citrusy scent. Medium intensity, 6-8 hour longevity. Not overpowering.")
      } else if (newMessages.length === 6) {
        botResponse = "Thank you for the details. I've standardized your request."
        const finalDescription =
          "Fresh citrus-based fragrance with medium intensity, long-lasting profile. Primary notes: bergamot, lemon, light floral undertones. Avoid: heavy musk, overly sweet components."
        setCurrentObjectDescription(finalDescription)
        setStandardizedRequest(finalDescription)
      } else {
        botResponse = "Is there anything else you'd like to add to your request?"
      }

      setMessages((prev) => [...prev, { role: "assistant", content: botResponse }])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const sendToFragranceHouse = () => {
    if (standardizedRequest) {
      // Create a new request
      const newRequest = {
        id: (requests.length + 1).toString(),
        name: `New Fragrance ${requests.length + 1}`,
        status: "sent" as const,
        date: new Date().toISOString().split("T")[0],
        description: standardizedRequest,
      }

      setRequests([...requests, newRequest])
      alert("Request sent to fragrance house!")
    }
  }

  const selectRequest = (requestId: string) => {
    setSelectedRequestId(requestId)
    const selectedRequest = requests.find((req) => req.id === requestId)
    if (selectedRequest?.description) {
      setStandardizedRequest(selectedRequest.description)
      setCurrentObjectDescription(selectedRequest.description)
    } else {
      setStandardizedRequest(null)
      setCurrentObjectDescription(null)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Wrap with SidebarProvider */}
      <SidebarProvider>
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-semibold">My Requests</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {requests.map((request) => (
                <SidebarMenuItem key={request.id}>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${selectedRequestId === request.id ? "bg-primary/10 text-primary font-medium" : ""}`}
                    onClick={() => selectRequest(request.id)}
                  >
                    <div className="flex items-center gap-2">
                      {request.status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
                      {request.status === "sent" && <Send className="h-4 w-4 text-blue-500" />}
                      {request.status === "completed" && <Check className="h-4 w-4 text-green-500" />}
                      <span>{request.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{request.date}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="p-4">
              <Button className="w-full" onClick={sendToFragranceHouse} disabled={!standardizedRequest}>
                Send to Fragrance House
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Standardized Request Display */}
          {standardizedRequest && (
            <div className="border-b bg-muted/50 p-4">
              <h3 className="mb-2 font-medium">Standardized Fragrance Request:</h3>
              <p className="text-sm">{standardizedRequest}</p>
            </div>
          )}

          {/* Current Object Description */}
          {currentObjectDescription && !standardizedRequest && (
            <div className="border-b p-4">
              <h3 className="mb-2 font-medium">Current Description:</h3>
              <Card>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {currentObjectDescription.split(". ").map((segment, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your fragrance..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

