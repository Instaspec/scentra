"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Send, Clock, Check, Plus } from "lucide-react"
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
import { set } from 'date-fns'

type Message = {
  role: "user" | "assistant"
  content: string
}

type Request = {
  id: string
  name: string
  status: "editing" | "requested" | "confirmed"
  date: string
  description?: string
  messages: Message[] // Update to use the unified Message type
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
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [requests, setRequests] = useState<Request[]>([])

  // Fetch requests from the local JSON file
  useEffect(() => {
    const fetchRequests = async () => {
      const res = await fetch("/api/chats")
      const data = await res.json()
      setRequests(data)

      // Initialize messages from the first request if available
      if (data.length > 0 && data[0].messages) {
        setMessages(data[0].messages)
      }
    }
    fetchRequests()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    let updatedChat: Request

    if (!selectedRequestId) {
      // Create a new chat
      updatedChat = {
        id: (requests.length + 1).toString(),
        name: `New Fragrance ${requests.length + 1}`,
        status: "editing",
        date: new Date().toISOString(),
        description: "",
        messages: [
          { role: "assistant", content: "What kind of fragrance would you like to create?" },
          { role: "user", content: input },
        ],
      }

      // Add the new chat to the state
      setRequests([...requests, updatedChat])
      setSelectedRequestId(updatedChat.id)
      setMessages(updatedChat.messages)

      // Save the new chat to the backend
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedChat),
      })

      if (response.ok) {
        const updatedRequests = await response.json()
        setRequests(updatedRequests)
      }
    } else {
      // Update an existing chat
      const existingChat = requests.find((req) => req.id === selectedRequestId)

      if (!existingChat) {
        console.error(`Chat with ID ${selectedRequestId} not found.`)
        return
      }

      // Add the new user input to the chat's messages
      const updatedMessages = [...existingChat.messages, { role: "user", content: input }]
      updatedChat = {
        ...existingChat,
        messages: updatedMessages,
      }

      // Update the chat in the state
      setRequests(requests.map((req) => (req.id === selectedRequestId ? updatedChat : req)))
      setMessages(updatedMessages)

      // Save the updated chat to the backend
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedChat),
      })

      if (response.ok) {
        const updatedRequests = await response.json()
        setRequests(updatedRequests)
      }
    }

    setInput("") // Clear input after sending the message

    // Fetch OpenAI response
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedChat.messages,
        description: updatedChat.description, // Include the description
      }),
    })

    if (response.ok) {
      const { description, instruction } = await response.json()

      setStandardizedRequest(description)

      console.log("DESCRIPTION", description)
      console.log("INSTRUCTION", instruction)

      // Finalize the assistant's response
      const updatedMessages = [...updatedChat.messages, { role: "assistant", content: instruction }]
      const finalUpdatedChat = { ...updatedChat, messages: updatedMessages }

      // Update the chat with the assistant's response in the state
      setMessages(updatedMessages)
      setRequests(requests.map((req) => (req.id === updatedChat.id ? finalUpdatedChat : req)))

      // Save the updated chat with the assistant's response to the backend
      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalUpdatedChat),
      })
    } else {
      console.error("Failed to fetch OpenAI response")
    }
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
        status: "requested" as const,
        date: new Date().toISOString(),
        description: standardizedRequest,
        messages,
      }

      setRequests([...requests, newRequest])
      alert("Request sent to fragrance house!")
    }
  }

  const selectRequest = (requestId: string) => {
    setSelectedRequestId(requestId)
    const selectedRequest = requests.find((req) => req.id === requestId)
    if (selectedRequest) {
      setMessages(selectedRequest.messages)
      setStandardizedRequest(selectedRequest.description || null)
    } else {
      setMessages([])
      setStandardizedRequest(null)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Wrap with SidebarProvider */}
      <SidebarProvider>
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 flex items-center flex-row">
            <h2 className="text-xl font-semibold flex-1">My Requests</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedRequestId(null)} // Reset selectedRequestId
            >
              <Plus className="h-5 w-5" />
            </Button>
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
                      {request.status === "editing" && <Clock className="h-4 w-4 text-yellow-500" />}
                      {request.status === "requested" && <Send className="h-4 w-4 text-blue-500" />}
                      {request.status === "confirmed" && <Check className="h-4 w-4 text-green-500" />}
                      <span>{request.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(request.date).toLocaleDateString()}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="p-4">
              <Button className="w-full" onClick={sendToFragranceHouse} disabled={!standardizedRequest}>
                Send Request
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Initial Screen */}
          {!selectedRequestId && (
            <div className="flex flex-1 items-center justify-center flex-col gap-4">
              <h2 className="text-xl font-semibold text-center">
                What kind of fragrance would you like to create?
              </h2>
              <div className="text-sm text-muted-foreground text-center space-y-2">
                <p><strong>Product & Market</strong> – What’s the product type and target audience?</p>
                <p><strong>Fragrance Profile</strong> – Preferred olfactive family, key notes, and reference scents?</p>
                <p><strong>Story & Emotion</strong> – What mood or experience should it evoke?</p>
                <p><strong>Technical Specs</strong> – Desired concentration, ingredient restrictions?</p>
                <p><strong>Market & Positioning</strong> – Competitor references, unique selling points?</p>
                <p><strong>Budget & Timeline</strong> – What are the financial and deadline constraints?</p>
              </div>
            </div>
          )}

          {/* Standardized Request Display */}
          {selectedRequestId && standardizedRequest && (
            <div className="border-b bg-muted/50 p-4">
              <h3 className="mb-2 font-medium">Standardized Fragrance Request:</h3>
              <p className="text-sm">{standardizedRequest}</p>
            </div>
          )}

          {/* Chat Area */}
          {selectedRequestId && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

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
      </SidebarProvider >
    </div >
  )
}

