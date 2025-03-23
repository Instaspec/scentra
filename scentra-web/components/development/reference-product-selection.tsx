"use client";

import { useState } from "react";
import { Check, FileText, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Oil } from "@/lib/types";

type ReferenceProduct = {
  id: string;
  name: string;
  description: string;
  compounds: string[];
  ingredients: string[];
  selected: boolean;
};

type ReferenceProductSelectionProps = {
  oils: Oil[];
  isLoadingOils: boolean;
};

export function ReferenceProductSelection({
  oils,
  isLoadingOils,
}: ReferenceProductSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState<ReferenceProduct[]>([
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
      selected: false,
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
      selected: false,
    },
    {
      id: "3",
      name: "Morning Zest",
      description: "Energizing citrus with green notes, long-lasting",
      compounds: ["Limonene", "Pinene", "Linalyl acetate", "Terpineol"],
      ingredients: [
        "Lemon oil",
        "Petitgrain oil",
        "Grapefruit oil",
        "Green tea extract",
      ],
      selected: false,
    },
    {
      id: "4",
      name: "Citrus Garden",
      description: "Balanced citrus and herbal blend with medium projection",
      compounds: ["Limonene", "Linalool", "Terpinene", "Caryophyllene"],
      ingredients: [
        "Bergamot oil",
        "Lemon verbena",
        "Mandarin oil",
        "Basil extract",
      ],
      selected: false,
    },
  ]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.compounds.some((c) =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      product.ingredients.some((i) =>
        i.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const toggleProductSelection = (id: string) => {
    setProducts(
      products.map((product) =>
        product.id === id
          ? { ...product, selected: !product.selected }
          : product
      )
    );
  };

  const selectedProducts = products.filter((p) => p.selected);

  return (
    <div className="space-y-6 w-full">
      {/* Selected Products Summary */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Selected Reference Products
          </CardTitle>
          <CardDescription>
            Products selected as reference for the new fragrance development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedProducts.length === 0 ? (
            <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
              No reference products selected yet. Select products from the list
              below.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <Badge key={product.id} variant="secondary" className="text-sm">
                  {product.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Product List */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reference Products
          </CardTitle>
          <CardDescription>
            Select internal products that match the client's description.
          </CardDescription>
          <div className="mt-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, compounds or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    product.selected ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{product.name}</h3>
                        {product.selected && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                    <Checkbox
                      checked={product.selected}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">
                        Chemical Compounds
                      </h4>
                      <ul className="space-y-1 text-xs">
                        {product.compounds.map((compound) => (
                          <li key={compound} className="text-muted-foreground">
                            {compound}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium">
                        Raw Ingredients
                      </h4>
                      <ul className="space-y-1 text-xs">
                        {product.ingredients.map((ingredient) => (
                          <li
                            key={ingredient}
                            className="text-muted-foreground"
                          >
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Reference Selection Notes</CardTitle>
          <CardDescription>
            Add your notes about the selected reference products.
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
