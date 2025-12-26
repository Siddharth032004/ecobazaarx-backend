import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export interface EcoInputItem {
  name: string;
  weight: string;
}

export interface EcoInputsData {
  materials: EcoInputItem[];
  manufacturing: EcoInputItem[];
  packaging: EcoInputItem[];
}

interface EcoImpactInputsProps {
  value: EcoInputsData;
  onChange: (value: EcoInputsData) => void;
}

// Material Factors (kg CO2e per kg) - Copied from Backend CarbonCalculator.java
const MATERIAL_DATA: { name: string; factor: number }[] = [
  { name: "Raw Cotton", factor: 5.92 },
  { name: "Polyester", factor: 5.5 },
  { name: "Organic Cotton", factor: 3.8 },
  { name: "Recycled Polyester", factor: 2.1 },
  { name: "Nylon", factor: 7.3 },
  { name: "Wool", factor: 20.0 },
  { name: "Silk", factor: 25.0 },
  { name: "Leather", factor: 30.0 },
  { name: "Denim", factor: 6.0 },
  { name: "Linen", factor: 4.5 },
  { name: "Hemp", factor: 3.5 },
  { name: "Bamboo", factor: 3.0 },
  { name: "Viscose", factor: 4.2 },
  { name: "Tencel", factor: 3.8 },
  // Generic Options
  { name: "Other – Textile", factor: 6.5 },
  { name: "Other – Plastic", factor: 7.0 },
  { name: "Other – Natural Material", factor: 4.5 },
  { name: "Other – Synthetic Material", factor: 6.8 },
];

const MANUFACTURING_DATA: { name: string; factor: number }[] = [
  { name: "Yarn Spinning", factor: 3.0 },
  { name: "Weaving", factor: 4.0 },
  { name: "Knitting", factor: 3.5 },
  { name: "Dyeing", factor: 4.0 },
  { name: "Printing", factor: 2.5 },
  { name: "Cut & Sew", factor: 1.0 },
  { name: "Finishing", factor: 1.5 },
  { name: "Washing", factor: 0.8 },
  { name: "Embroidery", factor: 1.2 },
  { name: "Assembly", factor: 0.5 },
  // Generic Options
  { name: "Other – Generic Manufacturing", factor: 3.0 },
];

const PACKAGING_DATA: { name: string; factor: number }[] = [
  { name: "Plastic Bag", factor: 2.0 },
  { name: "Cardboard Box", factor: 0.9 },
  { name: "Paper Wrap", factor: 0.5 },
  { name: "Jute Bag", factor: 0.3 },
  { name: "Biodegradable Plastic", factor: 1.2 },
  { name: "Recycled Paper", factor: 0.6 },
  { name: "Bubble Wrap", factor: 2.5 },
  // Generic Options
  { name: "Other – Generic Packaging", factor: 1.5 },
];

export const EcoImpactInputs: React.FC<EcoImpactInputsProps> = ({ value, onChange }) => {
  // Ensure we have default values to avoid null/undefined errors
  const data = {
    materials: value?.materials || [],
    manufacturing: value?.manufacturing || [],
    packaging: value?.packaging || [],
  };

  const updateItem = (
    section: "materials" | "manufacturing" | "packaging",
    index: number,
    field: "name" | "weight",
    val: string | number
  ) => {
    const newList = [...data[section]];
    const item = { ...newList[index] };
    if (field === "name") {
      item.name = val as string;
    } else {
      // Validate and clean number input
      // Remove leading zeros (e.g. "0789" -> "789", "00.5" -> "0.5")
      // but preserve "0" and "0." 
      let cleanVal = String(val);
      if (cleanVal.length > 1 && cleanVal.startsWith("0") && cleanVal[1] !== ".") {
        cleanVal = cleanVal.replace(/^0+/, "");
      }
      item.weight = cleanVal;
    }
    newList[index] = item;
    onChange({ ...data, [section]: newList });
  };

  const addItem = (section: "materials" | "manufacturing" | "packaging") => {
    onChange({
      ...data,
      [section]: [...data[section], { name: "", weight: "" }],
    });
  };

  const removeItem = (section: "materials" | "manufacturing" | "packaging", index: number) => {
    const newList = [...data[section]];
    newList.splice(index, 1);
    onChange({ ...data, [section]: newList });
  };

  const renderSection = (
    title: string,
    section: "materials" | "manufacturing" | "packaging",
    options: { name: string; factor: number }[],
    addItemLabel: string,
    placeholderText: string
  ) => (
    <div className="space-y-4 border p-4 rounded-md bg-muted/20">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{placeholderText}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addItem(section)}
        >
          <Plus className="h-4 w-4 mr-1" /> {addItemLabel}
        </Button>
      </div>
      {data[section].map((item, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-xs">
              {section === "materials" ? "Material Name" : "Process / Type"}
            </Label>
            <Select
              value={item.name}
              onValueChange={(val) => updateItem(section, index, "name", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.name} value={opt.name}>
                    {opt.name} ({opt.factor} kg CO₂/kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <Label className="text-xs">Weight (kg)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.weight}
              onChange={(e) => updateItem(section, index, "weight", e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive mb-0.5"
            onClick={() => removeItem(section, index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {data[section].length === 0 && (
        <p className="text-xs text-muted-foreground italic">No items added.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-primary">Eco-Impact Calculation (System Calculated)</h3>
      <p className="text-xs text-muted-foreground">
        Provide details about materials, manufacturing, and packaging. The system will calculate the carbon footprint automatically.
      </p>

      {renderSection(
        "Materials",
        "materials",
        MATERIAL_DATA,
        "Add material item",
        "Select materials and their weight."
      )}

      {renderSection(
        "Manufacturing Process",
        "manufacturing",
        MANUFACTURING_DATA,
        "Add manufacturing item",
        "Select manufacturing processes and the weight of product processed."
      )}

      {renderSection(
        "Packaging",
        "packaging",
        PACKAGING_DATA,
        "Add packaging item",
        "Select packaging materials and their weight."
      )}
    </div>
  );
};
