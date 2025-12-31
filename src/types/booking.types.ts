export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
}

export interface Booking {
  _id: string;
  plotId: {
    _id: string;
    plotNumber: string;
    area: number;
    areaUnit: string;
    price: number;
    facing: string;
    status: string;
  };
  blockId: string; // Or populated object if backend changes, but currently looks like ID in filter, likely populated in response but backend code says: .populate("plotId"...).populate("projectId"...).populate("brokerId"...).populate("developerId"...) - blockId is NOT populated in the provided snippet? Wait.
  // The provided snippet:
  // .populate("plotId", "plotNumber area areaUnit price facing status")
  // .populate("projectId", "name address projectId")
  // .populate("brokerId", "name email phone")
  // .populate("developerId", "name email")
  // It doesn't populate blockId. So it remains an ID or ObjectId.

  projectId: {
    _id: string;
    name: string;
    address: {
      state: string;
      city: string;
      address: string;
      pincode: string;
    };
    projectId?: string;
  };
  brokerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  developerId: {
    _id: string;
    name: string;
    email: string;
  };
  customerDetails: CustomerDetails;
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  bookingDate: string;
  notes?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  bookingStatus?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  blockId?: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
