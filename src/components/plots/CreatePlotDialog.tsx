import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { useCreatePlot } from "@/hooks/usePlot";
import {
  CreatePlotInput,
  PlotAreaUnit,
  Facing,
  PlotType,
} from "@/types/project.types";

// Validation Schema
const createPlotSchema = z.object({
  plotNumber: z.string().min(1, "Plot number is required"),
  area: z.coerce.number().positive("Area must be positive"),
  areaUnit: z.enum(["SQ_FT", "SQ_METER", "SQ_YARDS", "ACRES"] as const),
  price: z.coerce.number().positive("Price must be positive"),
  pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
  facing: z.enum([
    "NORTH",
    "SOUTH",
    "EAST",
    "WEST",
    "NORTH_EAST",
    "NORTH_WEST",
    "SOUTH_EAST",
    "SOUTH_WEST",
  ] as const),
  plotType: z.enum(["CORNER", "ROAD", "REGULAR"] as const).default("REGULAR"),
  frontRoadWidth: z.coerce.number().positive().optional(),
  dimensions: z
    .object({
      length: z.coerce.number().positive(),
      width: z.coerce.number().positive(),
      unit: z.enum(["FEET", "METER"] as const),
    })
    .optional(),
});

type CreatePlotFormValues = z.infer<typeof createPlotSchema>;

interface CreatePlotDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
}

const CreatePlotDialog = ({ projectId, trigger }: CreatePlotDialogProps) => {
  const [open, setOpen] = useState(false);
  const createPlot = useCreatePlot();

  const form = useForm<CreatePlotFormValues>({
    resolver: zodResolver(createPlotSchema) as any,
    defaultValues: {
      plotNumber: "",
      area: 0,
      areaUnit: "SQ_FT",
      price: 0,
      pricePerUnit: 0,
      facing: "NORTH",
      plotType: "REGULAR",
      dimensions: {
        length: 0,
        width: 0,
        unit: "FEET",
      },
    },
  });

  const onSubmit = async (data: CreatePlotFormValues) => {
    try {
      await createPlot.mutateAsync({
        ...data,
        projectId,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create plot:", error);
    }
  };

  const isSubmitting = createPlot.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            Add Plot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Plot</DialogTitle>
          <DialogDescription>
            Enter the details for the new plot in this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plot Number</FormLabel>
                    <FormControl>
                      <Input placeholder="A-101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plotType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plot Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="CORNER">Corner</SelectItem>
                        <SelectItem value="ROAD">Road Facing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areaUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SQ_FT">Sq. Ft</SelectItem>
                        <SelectItem value="SQ_METER">Sq. Meter</SelectItem>
                        <SelectItem value="SQ_YARDS">Sq. Yards</SelectItem>
                        <SelectItem value="ACRES">Acres</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facing</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Facing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NORTH">North</SelectItem>
                        <SelectItem value="SOUTH">South</SelectItem>
                        <SelectItem value="EAST">East</SelectItem>
                        <SelectItem value="WEST">West</SelectItem>
                        <SelectItem value="NORTH_EAST">North East</SelectItem>
                        <SelectItem value="NORTH_WEST">North West</SelectItem>
                        <SelectItem value="SOUTH_EAST">South East</SelectItem>
                        <SelectItem value="SOUTH_WEST">South West</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Price</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Unit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Dimensions (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dimensions.length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions.width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions.unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FEET">Feet</SelectItem>
                          <SelectItem value="METER">Meter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Plot
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlotDialog;
