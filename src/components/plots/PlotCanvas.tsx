"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  NodeResizer,
  Handle,
  Position,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Plot,
  PlotAreaUnit,
  PlotStatus,
  PlotType,
  Facing,
  Dimensions,
} from "@/types/project.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useBulkCreatePlots,
  useBulkUpdatePlots,
  useDeletePlot,
} from "@/hooks/usePlot";
import { toast } from "sonner";
import {
  Grip,
  Loader2,
  Map as MapIcon,
  MousePointer2,
  Plus,
  Trash2,
} from "lucide-react";

type PlotNodeData = {
  plotNumber: string;
  area: number;
  areaUnit: PlotAreaUnit;
  price: number;
  pricePerUnit: number;
  facing: Facing;
  plotType: PlotType;
  status: PlotStatus;
  dimensions?: Dimensions;
  frontRoadWidth?: number;
  isNew: boolean;
};

const statusColor: Record<PlotStatus, string> = {
  available: "bg-emerald-500",
  booked: "bg-blue-500",
  reserved: "bg-amber-500",
  sold: "bg-rose-500",
};

const PlotNode = ({
  data,
  selected,
}: {
  data: PlotNodeData;
  selected: boolean;
}) => {
  return (
    <>
      <NodeResizer
        color="#3b82f6"
        isVisible={selected}
        minWidth={60}
        minHeight={60}
      />
      <div
        className={cn(
          "h-full w-full rounded-md border-2 text-xs shadow-sm transition",
          selected ? "border-primary" : "border-white/20"
        )}
      >
        <div
          className={cn(
            "flex h-full flex-col justify-between rounded-[6px] p-2 text-white",
            statusColor[data.status]
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[11px]">{data.plotNumber}</span>
            <Badge variant="secondary" className="h-5 text-[9px] uppercase">
              {data.plotType.toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span>
              {data.area} {data.areaUnit.replace("SQ_", "Sq ")}
            </span>
            <span className="rounded bg-black/20 px-1">
              ₹{data.pricePerUnit.toLocaleString()}
            </span>
          </div>
          {data.isNew && (
            <span className="absolute -top-2 -right-2 rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-primary shadow">
              Draft
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
};

const nodeTypes = {
  plotNode: PlotNode,
};

interface PlotCanvasProps {
  projectId: string;
  plots: Plot[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const PlotCanvasInner = ({
  projectId,
  plots,
  isLoading = false,
  onRefresh,
}: PlotCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [dirtyNodeIds, setDirtyNodeIds] = useState<Set<string>>(new Set());

  const bulkCreate = useBulkCreatePlots();
  const bulkUpdate = useBulkUpdatePlots();
  const deletePlot = useDeletePlot();
  const { fitView } = useReactFlow();

  // Sync plots from API into React Flow nodes
  useEffect(() => {
    setNodes((prevNodes) => {
      const drafts = prevNodes.filter((n) => n.data.isNew);
      const mapped: Node<PlotNodeData>[] = plots.map((p) => ({
        id: p._id,
        type: "plotNode",
        position: p.canvasPosition
          ? { x: p.canvasPosition.x, y: p.canvasPosition.y }
          : { x: (p.area % 400) + 50, y: (p.area % 300) + 50 },
        data: {
          plotNumber: p.plotNumber,
          area: p.area,
          areaUnit: p.areaUnit,
          price: p.price,
          pricePerUnit: p.pricePerUnit,
          facing: p.facing,
          plotType: p.plotType ?? "REGULAR",
          status: p.status,
          dimensions: p.dimensions,
          frontRoadWidth: p.frontRoadWidth,
          isNew: false,
        },
        style: {
          width: p.canvasPosition?.width || 120,
          height: p.canvasPosition?.height || 90,
        },
      }));
      return [...mapped, ...drafts];
    });
  }, [plots, setNodes]);

  useEffect(() => {
    if (plots.length > 0) {
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [plots.length, fitView]);

  const selectedNode = useMemo(
    () => nodes.find((n) => selectedNodeIds.includes(n.id)),
    [nodes, selectedNodeIds]
  );

  const pendingCreates = useMemo(
    () => nodes.filter((n) => n.data.isNew),
    [nodes]
  );
  const pendingMoves = useMemo(
    () => nodes.filter((n) => !n.data.isNew && dirtyNodeIds.has(n.id)),
    [nodes, dirtyNodeIds]
  );

  const handleAddPlot = useCallback(() => {
    const nextIndex = nodes.filter((n) => n.data.isNew).length + 1;
    const newNode: Node<PlotNodeData> = {
      id: `temp-${Date.now()}`,
      type: "plotNode",
      position: { x: 100 + nextIndex * 20, y: 100 + nextIndex * 20 },
      data: {
        plotNumber: `NEW-${nextIndex}`,
        area: 1200,
        areaUnit: "SQ_FT",
        price: 0,
        pricePerUnit: 0,
        facing: "NORTH",
        plotType: "REGULAR",
        status: "available",
        isNew: true,
      },
      style: { width: 120, height: 90 },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeIds([newNode.id]);
    toast.info("Draft plot added to canvas");
  }, [nodes, setNodes]);

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedNodeIds.length) {
      toast.message("Select a plot to delete");
      return;
    }
    const removable = nodes.filter((n) => selectedNodeIds.includes(n.id));
    if (!removable.length) return;
    if (
      !confirm(
        `Delete ${removable.length} plot${removable.length > 1 ? "s" : ""}?`
      )
    )
      return;

    const jobs: Promise<any>[] = [];
    removable.forEach((node) => {
      if (node.data.isNew) {
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
      } else {
        jobs.push(deletePlot.mutateAsync({ plotId: node.id, projectId }));
      }
    });
    if (jobs.length) {
      try {
        await Promise.all(jobs);
        toast.success("Deleted selected plots");
      } catch (err) {
        console.error(err);
      }
    }
    setSelectedNodeIds([]);
    onRefresh?.();
  }, [selectedNodeIds, nodes, deletePlot, projectId, setNodes, onRefresh]);

  const handleDuplicate = useCallback(() => {
    if (!selectedNodeIds.length) return;
    const toCopy = nodes.filter((n) => selectedNodeIds.includes(n.id));
    if (!toCopy.length) return;
    const copies = toCopy.map((n, idx) => ({
      ...n,
      id: `temp-${Date.now()}-${idx}`,
      data: { ...n.data, plotNumber: `${n.data.plotNumber}-copy`, isNew: true },
      position: { x: n.position.x + 20, y: n.position.y + 20 },
    }));
    setNodes((nds) => [...nds, ...copies]);
    setSelectedNodeIds(copies.map((c) => c.id));
    toast.success(`Duplicated ${copies.length} plot(s)`);
  }, [selectedNodeIds, nodes, setNodes]);

  const handleSave = async () => {
    const jobs: Promise<any>[] = [];

    if (pendingCreates.length) {
      jobs.push(
        bulkCreate.mutateAsync({
          projectId,
          plots: pendingCreates.map((n) => ({
            plotNumber: n.data.plotNumber,
            area: n.data.area,
            areaUnit: n.data.areaUnit,
            price: n.data.price,
            pricePerUnit: n.data.pricePerUnit,
            facing: n.data.facing,
            plotType: n.data.plotType,
            status: n.data.status,
            dimensions: n.data.dimensions,
            frontRoadWidth: n.data.frontRoadWidth,
            canvasPosition: {
              x: n.position.x,
              y: n.position.y,
              width: (n.style?.width as number) || 120,
              height: (n.style?.height as number) || 90,
            },
          })),
        })
      );
    }

    if (pendingMoves.length) {
      jobs.push(
        bulkUpdate.mutateAsync({
          projectId,
          plots: pendingMoves.map((n) => ({
            _id: n.id,
            canvasPosition: {
              x: n.position.x,
              y: n.position.y,
              width: (n.style?.width as number) || 120,
              height: (n.style?.height as number) || 90,
            },
          })),
        })
      );
    }

    if (!jobs.length) {
      toast.message("Nothing to save", {
        description: "Add plots or move existing ones before saving.",
      });
      return;
    }

    try {
      await Promise.all(jobs);
      setDirtyNodeIds(new Set());
      setSelectedNodeIds([]);
      toast.success("Canvas changes saved");
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  const updateSelectedNode = <K extends keyof PlotNodeData>(
    key: K,
    value: PlotNodeData[K]
  ) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (!selectedNodeIds.includes(node.id)) return node;
        return { ...node, data: { ...node.data, [key]: value } };
      })
    );
    const anySelected = selectedNodeIds.some(
      (id) => !nodes.find((n) => n.id === id)?.data.isNew
    );
    if (anySelected) {
      setDirtyNodeIds((curr) => {
        const updated = new Set(curr);
        selectedNodeIds.forEach((id) => updated.add(id));
        return updated;
      });
    }
  };

  const isSaving = bulkCreate.isPending || bulkUpdate.isPending;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleDuplicate();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDuplicate, handleDeleteSelected]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Interactive Plot Canvas</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Add plots, drag to reposition, resize, then save in bulk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleAddPlot}>
            <Plus className="mr-2 h-4 w-4" />
            Add Plot
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            disabled={!selectedNode || isSaving}
            title="Ctrl/Cmd + D"
          >
            Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!selectedNode}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[3fr_1.1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              Available
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              Booked
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              Reserved
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              Sold
            </div>
          </div>

          <div className="relative h-[580px] rounded-lg border bg-muted/40">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={(changes) => {
                onNodesChange(changes);
                changes.forEach((change) => {
                  if (
                    change.type === "position" &&
                    change.dragging === false &&
                    change.id
                  ) {
                    const node = nodes.find((n) => n.id === change.id);
                    if (node && !node.data.isNew) {
                      setDirtyNodeIds((curr) => new Set(curr).add(change.id!));
                    }
                  }
                  if (change.type === "dimensions" && change.id) {
                    const node = nodes.find((n) => n.id === change.id);
                    if (node && !node.data.isNew) {
                      setDirtyNodeIds((curr) => new Set(curr).add(change.id!));
                    }
                  }
                });
              }}
              onSelectionChange={(selection) => {
                setSelectedNodeIds(selection.nodes.map((n) => n.id));
              }}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={4}
              defaultEdgeOptions={{ type: "straight" }}
            >
              <Background variant={BackgroundVariant.Dots} gap={32} size={1} />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const status = (node.data as PlotNodeData).status;
                  return statusColor[status].replace("bg-", "#");
                }}
                maskColor="rgb(0, 0, 0, 0.1)"
              />
            </ReactFlow>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Plus className="h-3 w-3" />
              Drafts: {pendingCreates.length}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Grip className="h-3 w-3" />
              Repositioned: {pendingMoves.length}
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={
                  isSaving || (!pendingCreates.length && !pendingMoves.length)
                }
                onClick={() => {
                  setNodes((nds) => nds.filter((n) => !n.data.isNew));
                  setDirtyNodeIds(new Set());
                  toast.success("Canvas drafts cleared");
                }}
              >
                Clear drafts
              </Button>
              <Button size="sm" disabled={isSaving} onClick={handleSave}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save layout
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between pb-2">
            <div>
              <p className="text-sm font-semibold">Plot inspector</p>
              <p className="text-xs text-muted-foreground">
                Edit draft details or view existing plot info.
              </p>
            </div>
          </div>

          {!selectedNode && (
            <div className="flex h-[520px] items-center justify-center rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              Select a plot to inspect or edit.
            </div>
          )}

          {selectedNode && (
            <ScrollArea className="h-[520px] pr-3">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge variant="secondary">
                    {selectedNode.data.plotType}
                  </Badge>
                  <Badge variant="outline">{selectedNode.data.status}</Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Plot number
                  </label>
                  <Input
                    value={selectedNode.data.plotNumber}
                    disabled={!selectedNode.data.isNew}
                    onChange={(e) =>
                      updateSelectedNode("plotNumber", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Area
                    </label>
                    <Input
                      type="number"
                      value={selectedNode.data.area}
                      disabled={!selectedNode.data.isNew}
                      onChange={(e) =>
                        updateSelectedNode("area", Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Unit
                    </label>
                    <Select
                      value={selectedNode.data.areaUnit}
                      onValueChange={(val) =>
                        updateSelectedNode("areaUnit", val as PlotAreaUnit)
                      }
                      disabled={!selectedNode.data.isNew}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SQ_FT">Sq. Ft</SelectItem>
                        <SelectItem value="SQ_METER">Sq. Meter</SelectItem>
                        <SelectItem value="SQ_YARDS">Sq. Yards</SelectItem>
                        <SelectItem value="ACRES">Acres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Price
                    </label>
                    <Input
                      type="number"
                      value={selectedNode.data.price}
                      disabled={!selectedNode.data.isNew}
                      onChange={(e) =>
                        updateSelectedNode("price", Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Price / unit
                    </label>
                    <Input
                      type="number"
                      value={selectedNode.data.pricePerUnit}
                      disabled={!selectedNode.data.isNew}
                      onChange={(e) =>
                        updateSelectedNode(
                          "pricePerUnit",
                          Number(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Facing
                    </label>
                    <Select
                      value={selectedNode.data.facing}
                      onValueChange={(val) =>
                        updateSelectedNode("facing", val as Facing)
                      }
                      disabled={!selectedNode.data.isNew}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Plot type
                    </label>
                    <Select
                      value={selectedNode.data.plotType}
                      onValueChange={(val) =>
                        updateSelectedNode("plotType", val as PlotType)
                      }
                      disabled={!selectedNode.data.isNew}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="CORNER">Corner</SelectItem>
                        <SelectItem value="ROAD">Road</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={selectedNode.data.status}
                    onValueChange={(val) =>
                      updateSelectedNode("status", val as PlotStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!selectedNode.data.isNew && (
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-100">
                    Existing plot details are read-only here. Use the table to
                    edit pricing or metadata. Moving/resizing the block will
                    bulk-save its new position.
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

const PlotCanvas = (props: PlotCanvasProps) => {
  return (
    <ReactFlowProvider>
      <PlotCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default PlotCanvas;
