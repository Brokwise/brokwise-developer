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
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { useCreatePlot, useBulkCreatePlots } from "@/hooks/usePlot";
import { useBlocksByProject } from "@/hooks/useBlock";

// Common Enums
const AREA_UNITS = ["SQ_FT", "SQ_METER", "SQ_YARDS", "ACRES"] as const;
const FACING_OPTS = [
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "NORTH_EAST",
  "NORTH_WEST",
  "SOUTH_EAST",
  "SOUTH_WEST",
] as const;
const PLOT_TYPES = ["CORNER", "ROAD", "REGULAR"] as const;
const DIMENSION_UNITS = ["FEET", "METER"] as const;

// Validation Schemas
const dimensionSchema = z.object({
  length: z.coerce.number().positive(),
  width: z.coerce.number().positive(),
  unit: z.enum(DIMENSION_UNITS),
});

const createPlotSchema = z.object({
  blockId: z.string().min(1, "Block is required"),
  plotNumber: z.string().min(1, "Plot number is required"),
  area: z.coerce.number().positive("Area must be positive"),
  areaUnit: z.enum(AREA_UNITS),
  price: z.coerce.number().positive("Price must be positive"),
  pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
  facing: z.enum(FACING_OPTS),
  plotType: z.enum(PLOT_TYPES).default("REGULAR"),
  frontRoadWidth: z.coerce.number().positive().optional(),
  dimensions: dimensionSchema.optional(),
});

const bulkCreatePlotSchema = z
  .object({
    blockId: z.string().min(1, "Block is required"),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    startNumber: z.coerce.number().int().min(1, "Start number is required"),
    endNumber: z.coerce.number().int().min(1, "End number is required"),
    digits: z.coerce.number().int().min(1).max(10).optional().default(1),
    area: z.coerce.number().positive("Area must be positive"),
    areaUnit: z.enum(AREA_UNITS),
    pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
    facing: z.enum(FACING_OPTS).default("NORTH"),
    plotType: z.enum(PLOT_TYPES).default("REGULAR"),
    dimensions: dimensionSchema.optional(),
  })
  .refine((data) => data.endNumber >= data.startNumber, {
    message: "End number must be greater than or equal to start number",
    path: ["endNumber"],
  });

type CreatePlotFormValues = z.infer<typeof createPlotSchema>;
type BulkCreatePlotFormValues = z.infer<typeof bulkCreatePlotSchema>;

interface CreatePlotDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
}

const CreatePlotDialog = ({ projectId, trigger }: CreatePlotDialogProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  const createPlot = useCreatePlot();
  const bulkCreatePlots = useBulkCreatePlots();
  const { data: blocks, isLoading: isBlocksLoading } =
    useBlocksByProject(projectId);

  const form = useForm<CreatePlotFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createPlotSchema) as any,
    defaultValues: {
      blockId: "",
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

  const bulkForm = useForm<BulkCreatePlotFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bulkCreatePlotSchema) as any,
    defaultValues: {
      blockId: "",
      prefix: "",
      suffix: "",
      startNumber: 1,
      endNumber: 10,
      digits: 3,
      area: 0,
      areaUnit: "SQ_FT",
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

  const onSingleSubmit = async (data: CreatePlotFormValues) => {
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

  const onBulkSubmit = async (data: BulkCreatePlotFormValues) => {
    try {
      const plots = [];
      const {
        startNumber,
        endNumber,
        prefix,
        suffix,
        digits,
        pricePerUnit,
        area,
        ...rest
      } = data;

      const totalPrice = area * pricePerUnit;

      for (let i = startNumber; i <= endNumber; i++) {
        const plotNumStr = i.toString().padStart(digits || 1, "0");
        const plotNumber = `${prefix || ""}${plotNumStr}${suffix || ""}`;

        plots.push({
          ...rest,
          plotNumber,
          area,
          pricePerUnit,
          price: totalPrice,
        });
      }

      await bulkCreatePlots.mutateAsync({
        projectId,
        plots,
      });
      setOpen(false);
      bulkForm.reset();
    } catch (error) {
      console.error("Failed to bulk create plots:", error);
    }
  };

  const isSubmitting = createPlot.isPending || bulkCreatePlots.isPending;

  // Watch area and pricePerUnit to auto-calculate total price in single form
  const singleArea = form.watch("area");
  const singlePricePerUnit = form.watch("pricePerUnit");

  React.useEffect(() => {
    if (singleArea && singlePricePerUnit) {
      form.setValue("price", singleArea * singlePricePerUnit);
    }
  }, [singleArea, singlePricePerUnit, form]);

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
      <DialogContent className="max-w-3xl h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Plot(s)</DialogTitle>
          <DialogDescription>
            Create a single plot or generate multiple plots at once.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Plot</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Creation</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSingleSubmit)}
                className="space-y-6"
              >
                {!isBlocksLoading && (!blocks || blocks.length === 0) ? (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
                    No blocks found. Please create a block first before adding
                    plots.
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="blockId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Block</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isBlocksLoading || !blocks?.length}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Block" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {blocks?.map((block) => (
                              <SelectItem key={block._id} value={block._id}>
                                {block.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            {AREA_UNITS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit.replace("SQ_", "Sq. ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            {PLOT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pricePerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price / Unit</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            {FACING_OPTS.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <Form {...bulkForm}>
              <form
                onSubmit={bulkForm.handleSubmit(onBulkSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={bulkForm.control}
                  name="blockId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Block</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isBlocksLoading || !blocks?.length}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Block" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {blocks?.map((block) => (
                            <SelectItem key={block._id} value={block._id}>
                              {block.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                  <h4 className="text-sm font-semibold">Plot Numbering</h4>
                  <div className="flex gap-2 items-end flex-wrap">
                    <FormField
                      control={bulkForm.control}
                      name="prefix"
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Prefix</FormLabel>
                          <FormControl>
                            <Input placeholder="P-" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bulkForm.control}
                      name="startNumber"
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Start</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="pb-3 text-muted-foreground">
                      <ArrowRight size={16} />
                    </div>
                    <FormField
                      control={bulkForm.control}
                      name="endNumber"
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>End</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bulkForm.control}
                      name="suffix"
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Suffix</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bulkForm.control}
                      name="digits"
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Digits</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={10} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormDescription>
                    Preview: {bulkForm.watch("prefix")}
                    {String(bulkForm.watch("startNumber")).padStart(
                      bulkForm.watch("digits") || 1,
                      "0"
                    )}
                    {bulkForm.watch("suffix")} ... {bulkForm.watch("prefix")}
                    {String(bulkForm.watch("endNumber")).padStart(
                      bulkForm.watch("digits") || 1,
                      "0"
                    )}
                    {bulkForm.watch("suffix")}
                  </FormDescription>
                  <FormMessage>
                    {bulkForm.formState.errors.endNumber?.message}
                  </FormMessage>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={bulkForm.control}
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
                    control={bulkForm.control}
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
                            {AREA_UNITS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit.replace("SQ_", "Sq. ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkForm.control}
                    name="pricePerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price / Unit</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={bulkForm.control}
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
                    control={bulkForm.control}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={bulkForm.control}
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
                            {FACING_OPTS.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkForm.control}
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
                            {PLOT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    Create{" "}
                    {Math.max(
                      0,
                      (bulkForm.watch("endNumber") || 0) -
                        (bulkForm.watch("startNumber") || 0) +
                        1
                    )}{" "}
                    Plots
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlotDialog;
