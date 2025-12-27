"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useProject, useActivateProject } from "@/hooks/useProject";
import {
  usePlotsByProject,
  useDeletePlot,
  useUpdatePlotStatus,
} from "@/hooks/usePlot";
import { PlotStatus } from "@/types/project.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  FileText,
  LandPlot,
  MapPin,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import CreatePlotDialog from "@/components/plots/CreatePlotDialog";
// import PlotCanvas from "@/components/plots/CreatePlotDialog";
import { Separator } from "@/components/ui/separator";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const getPlotStatusVariant = (status: PlotStatus): BadgeVariant => {
  switch (status) {
    case "available":
      return "secondary";
    case "booked":
      return "default";
    case "reserved":
      return "outline";
    case "sold":
      return "destructive";
    default:
      return "outline";
  }
};

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const [plotFilters, setPlotFilters] = useState({
    page: 1,
    limit: 50,
    status: undefined as PlotStatus | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
  });
  const [statusUpdateDialog, setStatusUpdateDialog] = useState<{
    isOpen: boolean;
    plotId: string | null;
    plotNumber: string | null;
    currentStatus: PlotStatus | null;
    newStatus: PlotStatus | null;
  }>({
    isOpen: false,
    plotId: null,
    plotNumber: null,
    currentStatus: null,
    newStatus: null,
  });

  const {
    data: projectData,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = useProject(id);
  const activateProject = useActivateProject();
  const {
    data: plotsData,
    isLoading: isPlotsLoading,
    refetch: refetchPlots,
  } = usePlotsByProject(id, plotFilters);
  const deletePlot = useDeletePlot();
  const updatePlotStatus = useUpdatePlotStatus();

  const handleDeletePlot = async (plotId: string) => {
    if (confirm("Are you sure you want to delete this plot?")) {
      await deletePlot.mutateAsync({ plotId, projectId: id });
    }
  };

  const handleOpenStatusUpdate = (
    plotId: string,
    plotNumber: string,
    currentStatus: PlotStatus
  ) => {
    setStatusUpdateDialog({
      isOpen: true,
      plotId,
      plotNumber,
      currentStatus,
      newStatus: currentStatus,
    });
  };

  const handleUpdateStatus = async () => {
    if (
      !statusUpdateDialog.plotId ||
      !statusUpdateDialog.newStatus ||
      statusUpdateDialog.newStatus === statusUpdateDialog.currentStatus
    ) {
      return;
    }

    try {
      await updatePlotStatus.mutateAsync({
        plotId: statusUpdateDialog.plotId,
        data: { status: statusUpdateDialog.newStatus },
      });
      setStatusUpdateDialog({
        isOpen: false,
        plotId: null,
        plotNumber: null,
        currentStatus: null,
        newStatus: null,
      });
      refetchPlots();
      refetchProject();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const handleActivateProject = async () => {
    try {
      await activateProject.mutateAsync(id);
      refetchProject();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  if (isProjectLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isProjectError || !projectData) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">
            Failed to load project details
          </p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { project, plotStats } = projectData;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant="outline" className="text-sm">
                {project.projectStatus}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                {project.address.city}, {project.address.state}
              </div>
              <div className="flex items-center gap-1">
                <FileText size={14} />
                RERA: {project.reraNumber}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                Possession:{" "}
                {format(new Date(project.possessionDate), "MMM yyyy")}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {project.projectStatus === "draft" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">Activate Project</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Activate Project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will make the project and its plots visible to
                      customers. Ensure you have added at least one plot before
                      activating.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleActivateProject}>
                      Activate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {/* <Button variant="outline">Edit Project</Button> */}
            {/* <Button variant="default">View on Map</Button> */}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Plots
              </p>
              <h3 className="text-2xl font-bold">{project.numberOfPlots}</h3>
            </div>
            <LandPlot className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Available
              </p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                {plotStats.available}
              </h3>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Booked/Sold
              </p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {plotStats.booked + plotStats.sold}
              </h3>
            </div>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reserved
              </p>
              <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {plotStats.reserved}
              </h3>
            </div>
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Plots Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Plot Inventory</h2>
          <CreatePlotDialog projectId={id} />
        </div>

        {/* <PlotCanvas
          projectId={id}
          plots={plotsData?.plots ?? []}
          isLoading={isPlotsLoading}
          onRefresh={() => {
            refetchPlots();
            refetchProject();
          }}
        /> */}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-muted/50 p-4 rounded-lg border">
          <div className="w-full sm:w-[200px]">
            <Select
              value={plotFilters.status || "all"}
              onValueChange={(val) =>
                setPlotFilters((prev) => ({
                  ...prev,
                  status: val === "all" ? undefined : (val as PlotStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Add more filters like price range if needed */}
        </div>

        {/* Plots Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plot No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPlotsLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : plotsData?.plots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No plots found. Add your first plot!
                  </TableCell>
                </TableRow>
              ) : (
                plotsData?.plots.map((plot) => (
                  <TableRow key={plot._id}>
                    <TableCell className="font-medium">
                      {plot.plotNumber}
                    </TableCell>
                    <TableCell className="capitalize">
                      {plot.plotType.toLowerCase()}
                    </TableCell>
                    <TableCell>
                      {plot.area} {plot.areaUnit.replace("SQ_", "Sq. ")}
                    </TableCell>
                    <TableCell>
                      {plot.dimensions
                        ? `${plot.dimensions.length} x ${plot.dimensions.width} ${plot.dimensions.unit}`
                        : "-"}
                    </TableCell>
                    <TableCell>₹{plot.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getPlotStatusVariant(plot.status)}>
                        {plot.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOpenStatusUpdate(
                                plot._id,
                                plot.plotNumber,
                                plot.status
                              )
                            }
                          >
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeletePlot(plot._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Plot
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {plotsData && plotsData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPlotFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={plotFilters.page <= 1}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {plotsData.pagination.page} of{" "}
              {plotsData.pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPlotFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={plotFilters.page >= plotsData.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setStatusUpdateDialog({
              isOpen: false,
              plotId: null,
              plotNumber: null,
              currentStatus: null,
              newStatus: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Plot Status</DialogTitle>
            <DialogDescription>
              Change the status for Plot #{statusUpdateDialog.plotNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    statusUpdateDialog.currentStatus
                      ? getPlotStatusVariant(statusUpdateDialog.currentStatus)
                      : "outline"
                  }
                >
                  {statusUpdateDialog.currentStatus}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select
                value={statusUpdateDialog.newStatus || ""}
                onValueChange={(value) =>
                  setStatusUpdateDialog((prev) => ({
                    ...prev,
                    newStatus: value as PlotStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setStatusUpdateDialog({
                  isOpen: false,
                  plotId: null,
                  plotNumber: null,
                  currentStatus: null,
                  newStatus: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                updatePlotStatus.isPending ||
                !statusUpdateDialog.newStatus ||
                statusUpdateDialog.newStatus ===
                  statusUpdateDialog.currentStatus
              }
            >
              {updatePlotStatus.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
