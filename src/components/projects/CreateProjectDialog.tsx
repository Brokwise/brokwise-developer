import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus } from "lucide-react";
import {
  createProjectSchema,
  CreateProjectFormValues,
} from "@/schema/project.schema";
import { useCreateProject, useUploadProjectImages } from "@/hooks/useProject";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  children?: React.ReactNode;
}

const CreateProjectDialog = ({ children }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const createProject = useCreateProject();
  const uploadImages = useUploadProjectImages();

  // Explicitly typing the form with CreateProjectFormValues and removing the strict resolver type check
  // or simply letting TypeScript infer where possible to avoid conflict between optional fields
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema) as any,
    defaultValues: {
      name: "",
      reraNumber: "",
      projectType: "land",
      projectUse: "residential",
      legalStatus: "clear_title",
      developmentStatus: "ready-to-develop",
      description: "",
      address: {
        state: "",
        city: "",
        address: "",
        pincode: "",
      },
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      possessionDate: new Date().toISOString().split("T")[0],
      amenities: [],
      images: [],
    },
  });

  const onSubmit = async (data: CreateProjectFormValues) => {
    try {
      let imageUrls: string[] = [];

      if (selectedImages.length > 0) {
        toast.info("Uploading images...");
        imageUrls = await uploadImages.mutateAsync({
          files: selectedImages,
        });
      }

      await createProject.mutateAsync({
        ...data,
        images: imageUrls,
        // Ensure coordinates are numbers
        location: {
          type: "Point",
          coordinates: [
            Number(data.location.coordinates[0]),
            Number(data.location.coordinates[1]),
          ],
        },
      });

      setOpen(false);
      form.reset();
      setSelectedImages([]);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const isSubmitting = createProject.isPending || uploadImages.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus size={18} className="mr-2" />
            Create Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add details for your new land development project.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Green Valley" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reraNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RERA Number</FormLabel>
                      <FormControl>
                        <Input placeholder="RERA123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Use</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select use" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">
                            Residential
                          </SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="agricultural">
                            Agricultural
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clear_title">
                            Clear Title
                          </SelectItem>
                          <SelectItem value="pending_conversion">
                            Pending Conversion
                          </SelectItem>
                          <SelectItem value="encumbrance_note">
                            Encumbrance Note
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="developmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Development Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ready-to-develop">
                            Ready to Develop
                          </SelectItem>
                          <SelectItem value="ready-to-move">
                            Ready to Move
                          </SelectItem>
                          <SelectItem value="under-development">
                            Under Development
                          </SelectItem>
                          <SelectItem value="phase-info">Phase Info</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="possessionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possession Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Project Images</FormLabel>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedImages(Array.from(e.target.files));
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedImages.length} files selected
                  </span>
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
                  Create Project
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
