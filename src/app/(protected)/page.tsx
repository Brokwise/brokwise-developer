"use client";

import { useProjects } from "@/hooks/useProject";
import React, { useState } from "react";
import { GetProjectsParams, ProjectStatus } from "@/types/project.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { useRouter } from "next/navigation";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const getStatusBadgeVariant = (status: ProjectStatus): BadgeVariant => {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "delisted":
      return "destructive";
    case "completed":
      return "outline";
    default:
      return "default";
  }
};

const HomePage = () => {
  const router = useRouter();
  const [params, setParams] = useState<GetProjectsParams>({
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, isError } = useProjects(params);

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      projectStatus: value === "all" ? undefined : (value as ProjectStatus),
      page: 1,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">Failed to load projects</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your land development projects
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search projects..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select
          value={params.projectStatus || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="delisted">Delisted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {data?.projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="mb-4 text-muted-foreground">
            Get started by creating your first project
          </p>
          <CreateProjectDialog />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.projects.map((project) => (
            <Card
              onClick={() => {
                router.push("/project/" + project._id);
              }}
              key={project._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <Badge variant={getStatusBadgeVariant(project.projectStatus)}>
                    {project.projectStatus}
                  </Badge>
                </div>
                {project.projectId && (
                  <p className="text-sm text-muted-foreground font-mono">
                    {project.projectId}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  <span className="line-clamp-1">
                    {project.address.city}, {project.address.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText size={16} />
                  <span>RERA: {project.reraNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>
                    Possession:{" "}
                    {format(new Date(project.possessionDate), "MMM yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm">
                    <span className="font-semibold">
                      {project.numberOfPlots}
                    </span>
                    <span className="text-muted-foreground"> plots</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {project.projectUse}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={params.page === 1}
            onClick={() =>
              setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={params.page === data.pagination.totalPages}
            onClick={() =>
              setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
