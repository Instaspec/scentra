"use client";

import { useEffect, useState } from "react";
import { MessageSquare, User, Bot, ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ClientRequestReview() {
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Default to collapsed
  const [messages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! Please describe the fragrance you're looking for in as much detail as possible.",
    },
    {
      role: "user",
      content:
        "I'm looking for a fresh, citrusy scent that reminds me of summer mornings. Something that's not too overpowering but lasts throughout the day.",
    },
    {
      role: "assistant",
      content:
        "Could you tell me more about the intensity and longevity you're looking for?",
    },
    {
      role: "user",
      content:
        "I'd like it to be medium intensity - noticeable but not overwhelming. And I need it to last at least 6-8 hours.",
    },
    {
      role: "assistant",
      content:
        "What specific notes or ingredients would you like to include or avoid?",
    },
    {
      role: "user",
      content:
        "I love bergamot and lemon notes. Maybe some light floral undertones. I definitely want to avoid heavy musk or anything too sweet.",
    },
    {
      role: "assistant",
      content: "Thank you for the details. I've standardized your request.",
    },
  ]);

  return (
    <div className="space-y-6 w-full">
      {/* Standardized Request */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Standardized Client Request
          </CardTitle>
          <CardDescription>
            The system has standardized the client's natural language
            description into technical specifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm">
              Fresh citrus-based fragrance with medium intensity, long-lasting
              profile. Primary notes: bergamot, lemon, light floral undertones.
              Avoid: heavy musk, overly sweet components.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat History - Collapsible */}
      <Card className="w-full">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Chat History</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CardDescription>
              Complete conversation with the client to understand their
              requirements.
            </CardDescription>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] items-start gap-2 rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="mt-1 h-4 w-4 shrink-0" />
                        ) : (
                          <Bot className="mt-1 h-4 w-4 shrink-0" />
                        )}
                        <div>{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Notes */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Development Notes</CardTitle>
          <CardDescription>
            Add your notes about this client request for the development team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
          <Button className="mt-4">Save Notes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
