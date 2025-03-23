"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Save,
  FileText,
  AlertTriangle,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Oil } from "@/lib/types";
type ReferenceProduct = {
  id: string;
  name: string;
  description: string;
  compounds: string[];
  ingredients: string[];
  file: string;
};

type VocabWord = {
  id: string;
  word: string;
  reason: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("reference-products");

  // Reference Products State
  const [referenceProducts, setReferenceProducts] = useState<
    ReferenceProduct[]
  >([
    {
      id: "1",
      name: "Citrus Splash",
      description: "Bright and refreshing citrus blend with bergamot and lemon",
      compounds: ["Limonene", "Linalool", "Citral", "Geraniol"],
      ingredients: [
        "Bergamot oil",
        "Lemon oil",
        "Orange peel extract",
        "Neroli oil",
      ],
      file: "citrus_splash.xlsx",
    },
    {
      id: "2",
      name: "Summer Breeze",
      description: "Light floral with citrus undertones, medium intensity",
      compounds: ["Linalool", "Citronellol", "Geraniol", "Limonene"],
      ingredients: [
        "Bergamot oil",
        "Rose extract",
        "Jasmine absolute",
        "Lemon oil",
      ],
      file: "summer_breeze.xlsx",
    },
  ]);

  const [oils, setOils] = useState<Record<string, Oil>>({});
  const [isLoadingOils, setIsLoadingOils] = useState(true);

  // Vocab Reference State
  const [vocabWords, setVocabWords] = useState<VocabWord[]>([
    {
      id: "1",
      word: "perfumey",
      reason: "Too subjective, use specific notes instead",
    },
    {
      id: "2",
      word: "strong",
      reason: "Ambiguous, use intensity scale (light, medium, heavy)",
    },
    { id: "3", word: "nice", reason: "Too vague, describe specific qualities" },
    {
      id: "4",
      word: "chemical",
      reason:
        "Negative connotation, use 'synthetic' or specific compound names",
    },
  ]);
  const [newWord, setNewWord] = useState("");
  const [newReason, setNewReason] = useState("");

  // Internal Protocol State
  const [internalProtocol, setInternalProtocol] = useState(
    `# Fragrance Development Protocol

## Description Format
1. Always begin with intensity level (light, medium, heavy)
2. Follow with longevity expectation (hours)
3. List primary notes in order of prominence
4. List secondary notes
5. Include any specific notes to avoid

## Development Process
1. Review client request thoroughly
2. Select at least 3 reference products for comparison
3. Start with base notes at 40-60% of formula
4. Add middle notes at 20-30%
5. Finish with top notes at 10-20%
6. Test for stability and longevity
7. Document all iterations

## Quality Standards
- All fragrances must pass 48-hour stability test
- Longevity must match client expectations ±1 hour
- Intensity must be consistent across batches
- All ingredients must be documented with exact percentages`
  );

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would handle file upload
    // For this demo, we'll simulate adding a new reference product
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newProduct: ReferenceProduct = {
        id: (referenceProducts.length + 1).toString(),
        name: file.name.split(".")[0].replace(/_/g, " "),
        description: "New uploaded reference product",
        compounds: ["Sample Compound 1", "Sample Compound 2"],
        ingredients: ["Sample Ingredient 1", "Sample Ingredient 2"],
        file: file.name,
      };

      setReferenceProducts([...referenceProducts, newProduct]);

      // Reset the file input
      e.target.value = "";
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

  // Delete Reference Product
  const deleteReferenceProduct = (id: string) => {
    setReferenceProducts(
      referenceProducts.filter((product) => product.id !== id)
    );
  };

  // Add New Vocab Word
  const addVocabWord = () => {
    if (newWord.trim() && newReason.trim()) {
      const newVocabWord: VocabWord = {
        id: (vocabWords.length + 1).toString(),
        word: newWord.trim(),
        reason: newReason.trim(),
      };

      setVocabWords([...vocabWords, newVocabWord]);
      setNewWord("");
      setNewReason("");
    }
  };

  // Delete Vocab Word
  const deleteVocabWord = (id: string) => {
    setVocabWords(vocabWords.filter((word) => word.id !== id));
  };

  // Save Protocol
  const saveProtocol = () => {
    // In a real app, this would save to a database
    alert("Protocol saved successfully!");
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/development">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Development Settings</h1>
        </div>
        <div>
          <Button onClick={() => window.history.back()}>Done</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="reference-products"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Reference Products
          </TabsTrigger>
          <TabsTrigger
            value="vocab-reference"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Vocab Reference
          </TabsTrigger>
          <TabsTrigger
            value="internal-protocol"
            className="flex items-center gap-2"
          >
            <FileCode className="h-4 w-4" />
            Internal Protocol
          </TabsTrigger>
        </TabsList>

        {/* Reference Products Tab */}
        <TabsContent value="reference-products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reference Products</CardTitle>
              <CardDescription>
                Upload and manage reference products with their descriptions,
                compounds, and ingredients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="file-upload" className="mb-2 block">
                  Upload Reference Product File
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.csv,.json"
                    onChange={handleFileUpload}
                  />
                  <Button variant="secondary" className="gap-2">
                    <Upload className="h-4 w-4" /> Upload
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload Excel, CSV, or JSON files containing reference product
                  data.
                </p>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-medium mb-4">
                Uploaded Reference Products
              </h3>

              <ScrollArea className="h-[400px] rounded-md border">
                <div className="p-4 space-y-4">
                  {referenceProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No reference products uploaded yet.
                    </div>
                  ) : (
                    referenceProducts.map((product) => (
                      <div key={product.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{product.name}</h4>
                              <Badge variant="outline">{product.file}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteReferenceProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <Separator className="my-3" />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              Chemical Compounds
                            </h5>
                            <ul className="space-y-1 text-xs">
                              {product.compounds.map((compound, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground"
                                >
                                  {compound}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              Raw Ingredients
                            </h5>
                            <ul className="space-y-1 text-xs">
                              {product.ingredients.map((ingredient, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground"
                                >
                                  {ingredient}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vocab Reference Tab */}
        <TabsContent value="vocab-reference" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Reference</CardTitle>
              <CardDescription>
                Manage list of words to avoid in fragrance descriptions and
                documentation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-word" className="mb-2 block">
                    Word to Avoid
                  </Label>
                  <Input
                    id="new-word"
                    placeholder="Enter word to avoid"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="new-reason" className="mb-2 block">
                    Reason
                  </Label>
                  <Input
                    id="new-reason"
                    placeholder="Why should this word be avoided?"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={addVocabWord} className="gap-2 mb-6">
                <Plus className="h-4 w-4" /> Add Word
              </Button>

              <Separator className="my-6" />

              <h3 className="text-lg font-medium mb-4">Words to Avoid</h3>

              <ScrollArea className="h-[400px] rounded-md border">
                <div className="p-4 space-y-2">
                  {vocabWords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No vocabulary words added yet.
                    </div>
                  ) : (
                    vocabWords.map((word) => (
                      <div
                        key={word.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="font-medium">{word.word}</div>
                          <div className="text-sm text-muted-foreground">
                            {word.reason}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteVocabWord(word.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal Protocol Tab */}
        <TabsContent value="internal-protocol" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Internal Protocol</CardTitle>
              <CardDescription>
                Define internal standards and protocols for fragrance
                development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[500px] font-mono text-sm"
                value={internalProtocol}
                onChange={(e) => setInternalProtocol(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveProtocol} className="gap-2">
                <Save className="h-4 w-4" /> Save Protocol
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
