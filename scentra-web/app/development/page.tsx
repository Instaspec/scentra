"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
  Beaker,
  MessageSquare,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClientRequestReview } from "@/components/development/client-request-review";
import { ReferenceProductSelection } from "@/components/development/reference-product-selection";
import { RecipeFormulation } from "@/components/development/recipe-formulation";
import { Oil } from "@/lib/types";

type Request = {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  date: string;
};

const steps = [
  { id: "review", name: "Client Request Review", icon: MessageSquare },
  { id: "reference", name: "Reference Product Selection", icon: FileText },
  { id: "recipe", name: "Recipe Formulation", icon: Beaker },
];

export default function DevelopmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [oils, setOils] = useState<Record<string, Oil>>({});
  const [isLoadingOils, setIsLoadingOils] = useState(true);
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      name: "Summer Breeze",
      status: "in-progress",
      date: "2025-03-15",
    },
    {
      id: "2",
      name: "Ocean Mist",
      status: "completed",
      date: "2025-03-10",
    },
    {
      id: "3",
      name: "Citrus Burst",
      status: "pending",
      date: "2025-03-20",
    },
  ]);
  const [selectedRequest, setSelectedRequest] = useState<string>("1");

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const _loadOils = async () => {
      try {
        const response = await fetch("/api/oils");
        if (!response.ok) {
          throw new Error(`Failed to fetch oils: ${response.status}`);
        }
        const _oils = await response.json();
        // Create a map where key is essential_oil_id and value is the oil entry
        const oilsMap = _oils.reduce((map: Record<string, Oil>, oil: Oil) => {
          if (oil.essential_oil_id) {
            map[oil.essential_oil_id] = oil;
          }
          return map;
        }, {});

        setOils(oilsMap);
        setIsLoadingOils(false);
      } catch (error) {
        console.error("Error loading oils:", error);
        setIsLoadingOils(false);
      }
    };
    _loadOils();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        {/* Navigation Bar */}
        <header className="border-b bg-background p-4 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Fragrance Development</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="request-select">Select Request:</Label>
                <select
                  id="request-select"
                  value={selectedRequest}
                  onChange={(e) => setSelectedRequest(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-1"
                >
                  {requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.name}
                    </option>
                  ))}
                </select>
              </div>
              <Link href="/development/setting">
                <Button variant="outline" size="icon" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="border-b bg-muted/30 px-6 py-4 w-full">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-medium">{steps[currentStep].name}</h2>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center"
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 ${
                      index < currentStep
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : index === currentStep
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 text-muted-foreground/50"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      index === currentStep
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content - Full Width Container */}
        <div className="flex-1 overflow-auto p-6 w-full max-w-none">
          <div className="mx-auto w-full max-w-none">
            {currentStep === 0 && <ClientRequestReview />}
            {currentStep === 1 && (
              <ReferenceProductSelection
                oils={oils}
                isLoadingOils={isLoadingOils}
                selectedRequest={selectedRequest}
              />
            )}
            {currentStep === 2 && (
              <RecipeFormulation
                oils={oils}
                isLoadingOils={isLoadingOils}
                selectedRequest={selectedRequest}
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="border-t bg-background p-4 w-full">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
