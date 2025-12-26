// Project Types

export interface Address {
  state: string;
  city: string;
  address: string;
  pincode: string;
}

export interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PriceRange {
  min: number;
  max: number;
}

export type ProjectType = "land";
export type ProjectUse = "residential" | "commercial" | "agricultural";
export type LegalStatus =
  | "clear_title"
  | "pending_conversion"
  | "encumbrance_note";
export type DevelopmentStatus =
  | "ready-to-develop"
  | "ready-to-move"
  | "under-development"
  | "phase-info";
export type ProjectStatus = "draft" | "active" | "delisted" | "completed";
export type AreaUnit =
  | "SQ_FT"
  | "SQ_METER"
  | "SQ_YARDS"
  | "ACRES"
  | "HECTARE"
  | "BIGHA";

export interface Project {
  _id: string;
  name: string;
  developerId: string;
  reraNumber: string;
  projectType: ProjectType;
  projectUse: ProjectUse;
  legalStatus: LegalStatus;
  numberOfPlots: number;
  address: Address;
  location: Location;
  possessionDate: string;
  description: string;
  approvalDocuments: string[];
  images: string[];
  amenities: string[];
  developmentStatus: DevelopmentStatus;
  projectStatus: ProjectStatus;
  projectId?: string;
  totalArea?: number;
  totalAreaUnit?: AreaUnit;
  priceRange?: PriceRange;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  reraNumber: string;
  projectType: ProjectType;
  projectUse: ProjectUse;
  legalStatus: LegalStatus;
  address: Address;
  location: Location;
  possessionDate: string;
  description: string;
  approvalDocuments?: string[];
  images?: string[];
  amenities?: string[];
  developmentStatus: DevelopmentStatus;
  totalArea?: number;
  totalAreaUnit?: AreaUnit;
  priceRange?: PriceRange;
}

export interface UpdateProjectInput {
  name?: string;
  reraNumber?: string;
  projectUse?: ProjectUse;
  legalStatus?: LegalStatus;
  address?: Address;
  location?: Location;
  possessionDate?: string;
  description?: string;
  approvalDocuments?: string[];
  images?: string[];
  amenities?: string[];
  developmentStatus?: DevelopmentStatus;
  totalArea?: number;
  totalAreaUnit?: AreaUnit;
  priceRange?: PriceRange;
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  projectUse?: ProjectUse;
  developmentStatus?: DevelopmentStatus;
  projectStatus?: ProjectStatus;
  search?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PlotStats {
  available: number;
  booked: number;
  reserved: number;
  sold: number;
}

export interface ProjectWithStats {
  project: Project;
  plotStats: PlotStats;
}

// Plot Types

export type PlotAreaUnit = "SQ_FT" | "SQ_METER" | "SQ_YARDS" | "ACRES";
export type DimensionUnit = "FEET" | "METER";
export type Facing =
  | "NORTH"
  | "SOUTH"
  | "EAST"
  | "WEST"
  | "NORTH_EAST"
  | "NORTH_WEST"
  | "SOUTH_EAST"
  | "SOUTH_WEST";
export type PlotType = "CORNER" | "ROAD" | "REGULAR";
export type PlotStatus = "available" | "booked" | "reserved" | "sold";

export interface Dimensions {
  length: number;
  width: number;
  unit: DimensionUnit;
}

export interface CanvasPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface Boundaries {
  type: "Polygon";
  coordinates: number[][][];
}

export interface Plot {
  _id: string;
  projectId: string;
  plotNumber: string;
  area: number;
  areaUnit: PlotAreaUnit;
  dimensions?: Dimensions;
  price: number;
  pricePerUnit: number;
  facing: Facing;
  plotType: PlotType;
  frontRoadWidth?: number;
  status: PlotStatus;
  canvasPosition?: CanvasPosition;
  boundaries?: Boundaries;
  bookedBy?: string;
  bookingDate?: string;
  soldDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlotInput {
  projectId: string;
  plotNumber: string;
  area: number;
  areaUnit: PlotAreaUnit;
  dimensions?: Dimensions;
  price: number;
  pricePerUnit: number;
  facing: Facing;
  plotType?: PlotType;
  frontRoadWidth?: number;
  status?: PlotStatus;
  canvasPosition?: CanvasPosition;
  boundaries?: Boundaries;
}

export interface UpdatePlotInput {
  plotNumber?: string;
  area?: number;
  areaUnit?: PlotAreaUnit;
  dimensions?: Dimensions;
  price?: number;
  pricePerUnit?: number;
  facing?: Facing;
  plotType?: PlotType;
  frontRoadWidth?: number;
  status?: PlotStatus;
  canvasPosition?: CanvasPosition;
  boundaries?: Boundaries;
}

export interface BulkCreatePlotsInput {
  projectId: string;
  plots: Omit<CreatePlotInput, "projectId">[];
}

export interface BulkUpdatePlotsInput {
  projectId: string;
  plots: {
    _id: string;
    canvasPosition?: CanvasPosition;
    boundaries?: Boundaries;
  }[];
}

export interface GetPlotsByProjectParams {
  page?: number;
  limit?: number;
  status?: PlotStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface PlotsResponse {
  plots: Plot[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdatePlotStatusInput {
  status: PlotStatus;
  bookedBy?: string;
}

export interface BulkCreatePlotsResponse {
  plots: Plot[];
  count: number;
}

export interface BulkUpdatePlotsResponse {
  matched: number;
  modified: number;
}
