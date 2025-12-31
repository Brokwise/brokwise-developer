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
import { Loader2, Plus } from "lucide-react";
import { useCreateBlock } from "@/hooks/useBlock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation Schema
const createBlockSchema = z.object({
  name: z.string().min(1, "Block name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "completed"]),
});

type CreateBlockFormValues = z.infer<typeof createBlockSchema>;

interface CreateBlockDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
}

const CreateBlockDialog = ({ projectId, trigger }: CreateBlockDialogProps) => {
  const [open, setOpen] = useState(false);
  const createBlock = useCreateBlock();

  const form = useForm<CreateBlockFormValues>({
    resolver: zodResolver(createBlockSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
    },
  });

  const onSubmit = async (data: CreateBlockFormValues) => {
    try {
      await createBlock.mutateAsync({
        ...data,
        projectId,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create block:", error);
    }
  };

  const isSubmitting = createBlock.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            Add Block
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Block</DialogTitle>
          <DialogDescription>
            Create a new block/phase for this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Phase 1 or Block A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Create Block
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBlockDialog;
