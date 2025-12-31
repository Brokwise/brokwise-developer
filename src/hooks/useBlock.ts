import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios, { ApiError, ApiResponse } from "./useAxios";
import { toast } from "sonner";
import {
  Block,
  CreateBlockInput,
  UpdateBlockInput,
} from "@/types/project.types";

export const useBlocksByProject = (projectId: string | undefined) => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["blocks", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data } = await axios.get<ApiResponse<Block[]>>(
        `/projects/${projectId}/blocks`
      );
      return data.data;
    },
    enabled: !!projectId,
  });
};

export const useCreateBlock = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBlockInput) => {
      const { data } = await axios.post<ApiResponse<Block>>(
        "/projects/blocks",
        input
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["blocks", data.projectId],
      });
      toast.success("Block created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to create block");
    },
  });
};

export const useUpdateBlock = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blockId,
      data,
    }: {
      blockId: string;
      data: UpdateBlockInput;
    }) => {
      const { data: result } = await axios.put<ApiResponse<Block>>(
        `/projects/blocks/${blockId}`,
        data
      );
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["blocks", data.projectId],
      });
      toast.success("Block updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update block");
    },
  });
};

export const useDeleteBlock = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blockId,
      projectId,
    }: {
      blockId: string;
      projectId: string;
    }) => {
      await axios.delete(`/projects/blocks/${blockId}`);
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["blocks", projectId],
      });
      toast.success("Block deleted successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to delete block");
    },
  });
};
