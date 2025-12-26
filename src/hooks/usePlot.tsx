import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios, { ApiResponse } from "./useAxios";
import { toast } from "sonner";
import {
  Plot,
  CreatePlotInput,
  UpdatePlotInput,
  BulkCreatePlotsInput,
  BulkUpdatePlotsInput,
  GetPlotsByProjectParams,
  PlotsResponse,
  UpdatePlotStatusInput,
  BulkCreatePlotsResponse,
  BulkUpdatePlotsResponse,
} from "@/types/project.types";
import { PROJECT_QUERY_KEYS } from "./useProject";

export const PLOT_QUERY_KEYS = {
  all: ["plots"] as const,
  lists: () => [...PLOT_QUERY_KEYS.all, "list"] as const,
  listByProject: (projectId: string, params: GetPlotsByProjectParams) =>
    [...PLOT_QUERY_KEYS.lists(), projectId, params] as const,
  details: () => [...PLOT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PLOT_QUERY_KEYS.details(), id] as const,
};

export const usePlotsByProject = (
  projectId: string,
  params: GetPlotsByProjectParams = {}
) => {
  const api = useAxios();

  return useQuery({
    queryKey: PLOT_QUERY_KEYS.listByProject(projectId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.status) searchParams.set("status", params.status);
      if (params.minPrice)
        searchParams.set("minPrice", params.minPrice.toString());
      if (params.maxPrice)
        searchParams.set("maxPrice", params.maxPrice.toString());

      const queryString = searchParams.toString();
      const url = `/projects/${projectId}/plots${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await api.get<ApiResponse<PlotsResponse>>(url);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

export const usePlot = (plotId: string) => {
  const api = useAxios();

  return useQuery({
    queryKey: PLOT_QUERY_KEYS.detail(plotId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Plot>>(
        `/projects/plots/${plotId}`
      );
      return response.data.data;
    },
    enabled: !!plotId,
  });
};

export const useCreatePlot = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePlotInput) => {
      const response = await api.post<ApiResponse<Plot>>(
        "/projects/plots",
        input
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PLOT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.detail(data.projectId),
      });
      toast.success("Plot created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create plot");
    },
  });
};

export const useBulkCreatePlots = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BulkCreatePlotsInput) => {
      const response = await api.post<ApiResponse<BulkCreatePlotsResponse>>(
        "/projects/plots/bulk",
        input
      );
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLOT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.detail(variables.projectId),
      });
      toast.success(`${data.count} plots created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create plots");
    },
  });
};

export const useUpdatePlot = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plotId,
      data,
    }: {
      plotId: string;
      data: UpdatePlotInput;
    }) => {
      const response = await api.put<ApiResponse<Plot>>(
        `/projects/plots/${plotId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PLOT_QUERY_KEYS.all });
      queryClient.setQueryData(PLOT_QUERY_KEYS.detail(data._id), data);
      toast.success("Plot updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update plot");
    },
  });
};

export const useUpdatePlotStatus = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plotId,
      data,
    }: {
      plotId: string;
      data: UpdatePlotStatusInput;
    }) => {
      const response = await api.patch<ApiResponse<Plot>>(
        `/projects/plots/${plotId}/status`,
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PLOT_QUERY_KEYS.all });
      queryClient.setQueryData(PLOT_QUERY_KEYS.detail(data._id), data);
      toast.success("Plot status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update plot status"
      );
    },
  });
};

export const useDeletePlot = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plotId,
      projectId,
    }: {
      plotId: string;
      projectId: string;
    }) => {
      const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
        `/projects/plots/${plotId}`
      );
      return { ...response.data.data, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PLOT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.detail(data.projectId),
      });
      toast.success("Plot deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete plot");
    },
  });
};

export const useBulkUpdatePlots = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BulkUpdatePlotsInput) => {
      const response = await api.put<ApiResponse<BulkUpdatePlotsResponse>>(
        "/projects/plots/bulk-update",
        input
      );
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PLOT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PROJECT_QUERY_KEYS.detail(variables.projectId),
      });
      toast.success(`${data.modified} plots updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update plots");
    },
  });
};
