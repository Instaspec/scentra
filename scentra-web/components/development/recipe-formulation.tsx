"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  Beaker,
  Save,
  Plus,
  Trash2,
  Copy,
  GripVertical,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Oil } from "@/lib/types";

type Ingredient = {
  id: string;
  name: string;
  dosage: number;
  unit: "%" | "ml" | "g";
};

type Recipe = {
  id: string;
  name: string;
  version: number;
  date: string;
  ingredients: Ingredient[];
  notes: string;
};

type RecipeFormulationProps = {
  oils: Record<string, Oil>;
  isLoadingOils: boolean;
  selectedRequest: string;
};

type ChatLog = {
  date: string;
  description: string;
  id: string;
  messages: {
    role: string;
    content: string;
  }[];
  name: string;
  status: string;
};

export function RecipeFormulation({
  oils,
  isLoadingOils,
  selectedRequest,
}: RecipeFormulationProps) {
  const [activeRecipeId, setActiveRecipeId] = useState("recipe-1");
  const [notes, setNotes] = useState("");
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientDosage, setNewIngredientDosage] = useState(1);
  const [newIngredientUnit, setNewIngredientUnit] = useState<"%" | "ml" | "g">(
    "%"
  );
  const [draggedIngredient, setDraggedIngredient] = useState<string | null>(
    null
  );
  const [isNewVersionDialogOpen, setIsNewVersionDialogOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [chatLog, setChatLog] = useState<ChatLog[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);
  const [currentDescription, setCurrentDescription] = useState<string>("");

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: "recipe-1",
      name: "Citrus Blend - Initial",
      version: 1,
      date: "2025-03-22",
      ingredients: [
        { id: "1", name: "Bergamot oil", dosage: 15, unit: "%" },
        { id: "2", name: "Lemon oil", dosage: 12, unit: "%" },
        { id: "3", name: "Neroli oil", dosage: 5, unit: "%" },
        { id: "4", name: "Petitgrain oil", dosage: 8, unit: "%" },
        { id: "5", name: "Jasmine absolute", dosage: 3, unit: "%" },
        { id: "6", name: "Orange blossom water", dosage: 4, unit: "%" },
        { id: "7", name: "Mandarin oil", dosage: 10, unit: "%" },
      ],
      notes:
        "Initial formulation based on client's request for a fresh citrus scent with floral undertones.",
    },
    {
      id: "recipe-2",
      name: "Citrus Blend - Refined",
      version: 2,
      date: "2025-03-22",
      ingredients: [
        { id: "1", name: "Bergamot oil", dosage: 18, unit: "%" },
        { id: "2", name: "Lemon oil", dosage: 15, unit: "%" },
        { id: "3", name: "Neroli oil", dosage: 3, unit: "%" },
        { id: "4", name: "Petitgrain oil", dosage: 6, unit: "%" },
        { id: "5", name: "Jasmine absolute", dosage: 2, unit: "%" },
        { id: "6", name: "Orange blossom water", dosage: 5, unit: "%" },
        { id: "7", name: "Mandarin oil", dosage: 12, unit: "%" },
        { id: "8", name: "Lemongrass oil", dosage: 4, unit: "%" },
      ],
      notes:
        "Increased citrus notes and added lemongrass for better longevity.",
    },
  ]);

  const activeRecipe = recipes.find((recipe) => recipe.id === activeRecipeId);

  const addIngredient = () => {
    if (!newIngredientName.trim() || !activeRecipe) return;

    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredientName,
      dosage: newIngredientDosage,
      unit: newIngredientUnit,
    };

    setRecipes(
      recipes.map((recipe) =>
        recipe.id === activeRecipe.id
          ? { ...recipe, ingredients: [...recipe.ingredients, newIngredient] }
          : recipe
      )
    );

    setNewIngredientName("");
    setNewIngredientDosage(1);
  };

  const removeIngredient = (recipeId: string, ingredientId: string) => {
    setRecipes(
      recipes.map((recipe) =>
        recipe.id === recipeId
          ? {
              ...recipe,
              ingredients: recipe.ingredients.filter(
                (i) => i.id !== ingredientId
              ),
            }
          : recipe
      )
    );
  };

  const updateIngredientDosage = (
    recipeId: string,
    ingredientId: string,
    dosage: number
  ) => {
    setRecipes(
      recipes.map((recipe) =>
        recipe.id === recipeId
          ? {
              ...recipe,
              ingredients: recipe.ingredients.map((i) =>
                i.id === ingredientId ? { ...i, dosage } : i
              ),
            }
          : recipe
      )
    );
  };

  const createNewVersionFromCurrent = () => {
    if (!activeRecipe) return;

    const newRecipe: Recipe = {
      id: `recipe-${recipes.length + 1}`,
      name: `${activeRecipe.name.split(" - ")[0]} - v${
        activeRecipe.version + 1
      }`,
      version: activeRecipe.version + 1,
      date: new Date().toISOString().split("T")[0],
      ingredients: [...activeRecipe.ingredients],
      notes: `Version ${activeRecipe.version + 1} based on ${
        activeRecipe.name
      }`,
    };

    setRecipes([...recipes, newRecipe]);
    setActiveRecipeId(newRecipe.id);
    setIsNewVersionDialogOpen(false);
  };

  const createNewVersionFromScratch = useCallback(() => {
    if (!activeRecipe) return;

    setIsAiGenerating(true);
    // Call API for recommendation based on current description
    async function fetchRecommendation() {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerDescription: currentDescription }),
      });
      const data = await response.json();
      console.log("Recommendation response:", data);
      // update the active recipe with the recommended oils
      // extract oil names, and blending notes
      const recommendedOils = data.recommended_oils;
      const recommendedOilsNames = recommendedOils.map((oil: any) => oil.name);
      const blendingNotes = data.blending_notes;
      const alternativeSuggestions = data.alternative_suggestions;

      // Generate random dosages that sum up to a value between 15-35%
      const totalDosage = Math.floor(Math.random() * (35 - 15 + 1)) + 15; // Random value between 15-35
      // Initialize an empty array to store dosages
      const dosages: number[] = [];

      // Calculate dosages one by one to avoid referencing before definition
      for (let index = 0; index < recommendedOils.length; index++) {
        // For all but the last item, generate a random proportion
        if (index < recommendedOils.length - 1) {
          const remaining = recommendedOils.length - index;
          // Ensure we don't use up too much for early items
          const maxForThis = (totalDosage * 0.7) / remaining;
          dosages.push(Math.round(Math.random() * maxForThis * 10) / 10);
        } else {
          // Last item gets whatever is left to ensure total adds up exactly
          const used = dosages.reduce((sum, value) => sum + value, 0);
          dosages.push(Math.round((totalDosage - used) * 10) / 10);
        }
      }

      // Create a new recipe with recommended oils
      const newRecipe: Recipe = {
        id: `ai-recipe-${recipes.length + 1}`,
        name: `${activeRecipe.name.split(" - ")[0]} - v${
          activeRecipe.version + 1
        }`,
        version: activeRecipe.version + 1,
        date: new Date().toISOString().split("T")[0],
        ingredients: recommendedOils.map((oil: any) => ({
          id: oil.oil_id,
          name: oil.name,
          dosage: dosages[recommendedOils.indexOf(oil)],
          unit: "%",
          reasoning: oil.reasoning,
          blendingSuggestions: oil.blending_suggestions,
        })),
        notes: `${blendingNotes}\n\nAlternative suggestions:\n${alternativeSuggestions.join(
          "\n"
        )}`,
      };

      // Add the new recipe to the recipes array
      setRecipes([...recipes, newRecipe]);
      setActiveRecipeId(newRecipe.id);
      console.log(`new recipe: ${JSON.stringify(newRecipe)}`);

      setNotes(blendingNotes + "\n" + alternativeSuggestions.join("\n"));
      setIsAiGenerating(false);
    }

    fetchRecommendation();
    setIsNewVersionDialogOpen(false);
  }, [activeRecipe, currentDescription, recipes]);

  const calculateTotal = (ingredients: Ingredient[]) => {
    return ingredients
      .filter((i) => i.unit === "%")
      .reduce((sum, ingredient) => sum + ingredient.dosage, 0);
  };

  // Drag and drop functionality
  const handleDragStart = (ingredientId: string) => {
    setDraggedIngredient(ingredientId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedIngredient || draggedIngredient === targetId) return;
  };

  const handleDrop = (targetId: string) => {
    if (!draggedIngredient || !activeRecipe || draggedIngredient === targetId)
      return;

    const draggedIndex = activeRecipe.ingredients.findIndex(
      (i) => i.id === draggedIngredient
    );
    const targetIndex = activeRecipe.ingredients.findIndex(
      (i) => i.id === targetId
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create a new array with the reordered ingredients
    const newIngredients = [...activeRecipe.ingredients];
    const [movedItem] = newIngredients.splice(draggedIndex, 1);
    newIngredients.splice(targetIndex, 0, movedItem);

    // Update the recipes state
    setRecipes(
      recipes.map((recipe) =>
        recipe.id === activeRecipe.id
          ? { ...recipe, ingredients: newIngredients }
          : recipe
      )
    );

    setDraggedIngredient(null);
  };

  useEffect(() => {
    const loadChatLog = async () => {
      try {
        const response = await fetch("/api/chats");
        if (!response.ok) {
          throw new Error(`Failed to fetch chat log: ${response.status}`);
        }
        const data = await response.json();
        setChatLog(data);
      } catch (error) {
        console.error("Error loading chat log:", error);
      }
    };

    loadChatLog();
  }, []);

  useEffect(() => {
    if (chatLog.length > 0) {
      for (const chat of chatLog) {
        if (chat.id === selectedRequest) {
          setSelectedChat(chat);
        }
      }
    }
  }, [chatLog, selectedRequest]);

  useEffect(() => {
    if (selectedChat) {
      // Check if the chat has a "requested" status and a non-empty description
      if (
        selectedChat.status === "requested" &&
        selectedChat.description.trim() !== ""
      ) {
        // If the chat has a requested status and description, set the current description
        setCurrentDescription(selectedChat.description);
        console.log(`current description: ${selectedChat.description}`);
      } else {
        // Otherwise, set an empty description
        setCurrentDescription("");
      }
    }
  }, [selectedChat]);

  return (
    <div className="space-y-6 w-full">
      {/* Recipe Selector and Controls */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Recipe Formulation
            </CardTitle>
            <Dialog
              open={isNewVersionDialogOpen}
              onOpenChange={setIsNewVersionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Copy className="h-4 w-4" /> Create New Version
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Recipe Version</DialogTitle>
                  <DialogDescription>
                    Choose how you want to create the new recipe version.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 p-4"
                    onClick={createNewVersionFromCurrent}
                  >
                    <Copy className="h-8 w-8" />
                    <span>Copy Current Version</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 p-4"
                    onClick={createNewVersionFromScratch}
                  >
                    <Sparkles className="h-8 w-8" />
                    <span>Start From AI Recipe</span>
                  </Button>
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => setIsNewVersionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Develop and refine fragrance recipes with precise ingredient
            dosages.
          </CardDescription>

          <div className="mt-4 flex items-center gap-4">
            <Label htmlFor="recipe-version" className="text-sm font-medium">
              Recipe Version:
            </Label>
            <Select value={activeRecipeId} onValueChange={setActiveRecipeId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a version" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name} (v{recipe.version} • {recipe.date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {activeRecipe && (
            <>
              {/* Ingredient List */}
              <div className="rounded-md border">
                <div className="flex items-center justify-between bg-muted p-3">
                  <h3 className="font-medium">Ingredients</h3>
                  <Badge variant="outline">
                    Total: {calculateTotal(activeRecipe.ingredients)}%
                  </Badge>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-3">
                    {isAiGenerating ? (
                      <div className="flex flex-col items-center justify-center h-[200px] gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Generating AI recipe...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                          <div className="col-span-1"></div>
                          <div className="col-span-5">Ingredient</div>
                          <div className="col-span-4">Dosage</div>
                          <div className="col-span-2">Actions</div>
                        </div>

                        {activeRecipe.ingredients.length === 0 ? (
                          <div className="py-8 text-center text-muted-foreground">
                            No ingredients added yet. Add your first ingredient
                            below.
                          </div>
                        ) : (
                          activeRecipe.ingredients.map((ingredient) => (
                            <div
                              key={ingredient.id}
                              className="mb-2 grid grid-cols-12 items-center gap-2 border border-transparent hover:border-muted rounded-md p-1"
                              draggable
                              onDragStart={() => handleDragStart(ingredient.id)}
                              onDragOver={(e) =>
                                handleDragOver(e, ingredient.id)
                              }
                              onDrop={() => handleDrop(ingredient.id)}
                            >
                              <div className="col-span-1 flex justify-center cursor-move">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="col-span-5">
                                <Input value={ingredient.name} readOnly />
                              </div>
                              <div className="col-span-4 flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={ingredient.dosage}
                                  onChange={(e) =>
                                    updateIngredientDosage(
                                      activeRecipe.id,
                                      ingredient.id,
                                      Number.parseFloat(e.target.value) || 0
                                    )
                                  }
                                  min={0}
                                  step={0.1}
                                  className="w-full"
                                />
                                <span className="text-sm">
                                  {ingredient.unit}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeIngredient(
                                      activeRecipe.id,
                                      ingredient.id
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}

                        {/* Add New Ingredient */}
                        <div className="mt-4 grid grid-cols-12 items-end gap-2 border-t pt-4">
                          <div className="col-span-1"></div>
                          <div className="col-span-5">
                            <Label
                              htmlFor="new-ingredient"
                              className="mb-2 block text-xs"
                            >
                              New Ingredient
                            </Label>
                            <Input
                              id="new-ingredient"
                              placeholder="Ingredient name"
                              value={newIngredientName}
                              onChange={(e) =>
                                setNewIngredientName(e.target.value)
                              }
                            />
                          </div>
                          <div className="col-span-4 flex items-center gap-2">
                            <div className="flex-1">
                              <Label
                                htmlFor="dosage"
                                className="mb-2 block text-xs"
                              >
                                Dosage
                              </Label>
                              <Input
                                id="dosage"
                                type="number"
                                value={newIngredientDosage}
                                onChange={(e) =>
                                  setNewIngredientDosage(
                                    Number.parseFloat(e.target.value) || 0
                                  )
                                }
                                min={0}
                                step={0.1}
                              />
                            </div>
                            <div className="w-16">
                              <Label
                                htmlFor="unit"
                                className="mb-2 block text-xs"
                              >
                                Unit
                              </Label>
                              <select
                                id="unit"
                                value={newIngredientUnit}
                                onChange={(e) =>
                                  setNewIngredientUnit(
                                    e.target.value as "%" | "ml" | "g"
                                  )
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="%">%</option>
                                <option value="ml">ml</option>
                                <option value="g">g</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Button
                              onClick={addIngredient}
                              className="w-full gap-1"
                            >
                              <Plus className="h-4 w-4" /> Add
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Recipe Notes */}
              <div>
                <Label htmlFor="recipe-notes" className="mb-2 block">
                  Recipe Notes
                </Label>
                <Textarea
                  id="recipe-notes"
                  placeholder="Add notes about this recipe version..."
                  value={activeRecipe.notes}
                  onChange={(e) => {
                    setRecipes(
                      recipes.map((r) =>
                        r.id === activeRecipe.id
                          ? { ...r, notes: e.target.value }
                          : r
                      )
                    );
                  }}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" /> Save Recipe
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Development Notes */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Development Notes</CardTitle>
          <CardDescription>
            Add your notes about the recipe formulation process.
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
