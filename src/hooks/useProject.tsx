import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios, { ApiResponse } from "./useAxios";
import { toast } from "sonner";
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectsParams,
  ProjectsResponse,
  ProjectWithStats,
} from "@/types/project.types";
import {
  uploadFileToFirebase,
  generateFilePath,
  convertImageToWebP,
} from "@/lib/firebase";

export const PROJECT_QUERY_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_QUERY_KEYS.all, "list"] as const,
  list: (params: GetProjectsParams) =>
    [...PROJECT_QUERY_KEYS.lists(), params] as const,
  details: () => [...PROJECT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PROJECT_QUERY_KEYS.details(), id] as const,
};

export const useProjects = (params: GetProjectsParams = {}) => {
  const api = useAxios();

  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.projectUse) searchParams.set("projectUse", params.projectUse);
      if (params.developmentStatus)
        searchParams.set("developmentStatus", params.developmentStatus);
      if (params.projectStatus)
        searchParams.set("projectStatus", params.projectStatus);
      if (params.search) searchParams.set("search", params.search);

      const queryString = searchParams.toString();
      const url = `/projects${queryString ? `?${queryString}` : ""}`;
      const response = await api.get<ApiResponse<ProjectsResponse>>(url);
      return response.data.data;
    },
  });
};

export const useProject = (projectId: string) => {
  const api = useAxios();

  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(projectId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ProjectWithStats>>(
        `/projects/${projectId}`
      );
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const response = await api.post<ApiResponse<Project>>("/projects", input);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create project");
    },
  });
};

export const useUpdateProject = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectInput;
    }) => {
      const response = await api.put<ApiResponse<Project>>(
        `/projects/${projectId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
      queryClient.setQueryData(PROJECT_QUERY_KEYS.detail(data._id), {
        project: data,
      });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update project");
    },
  });
};

export const useActivateProject = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await api.post<ApiResponse<Project>>(
        `/projects/${projectId}/activate`
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
      toast.success("Project activated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to activate project"
      );
    },
  });
};

export const useDeleteProject = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
        `/projects/${projectId}`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.all });
      toast.success("Project deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete project");
    },
  });
};

// Firebase Upload Utilities for Projects
export const useUploadProjectImages = () => {
  return useMutation({
    mutationFn: async ({
      files,
      projectId,
    }: {
      files: File[];
      projectId?: string;
    }) => {
      const uploadedUrls: string[] = [];
      const folder = projectId
        ? `projects/${projectId}/images`
        : "projects/temp/images";

      for (const file of files) {
        const webpFile = await convertImageToWebP(file);
        const path = generateFilePath(webpFile.name, folder);
        const url = await uploadFileToFirebase(webpFile, path);
        uploadedUrls.push(url);
      }

      return uploadedUrls;
    },
    onError: (error: any) => {
      toast.error("Failed to upload images");
      console.log("Upload error:", error);
    },
  });
};

export const useUploadProjectDocuments = () => {
  return useMutation({
    mutationFn: async ({
      files,
      projectId,
    }: {
      files: File[];
      projectId?: string;
    }) => {
      const uploadedUrls: string[] = [];
      const folder = projectId
        ? `projects/${projectId}/documents`
        : "projects/temp/documents";

      for (const file of files) {
        const path = generateFilePath(file.name, folder);
        const url = await uploadFileToFirebase(file, path);
        uploadedUrls.push(url);
      }

      return uploadedUrls;
    },
    onError: (error: any) => {
      toast.error("Failed to upload documents");
      console.error("Upload error:", error);
    },
  });
};
