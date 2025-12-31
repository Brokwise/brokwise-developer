import { useQuery } from "@tanstack/react-query";
import useAxios, { ApiResponse } from "./useAxios";
import { BookingsResponse, GetBookingsParams } from "@/types/booking.types";

export const BOOKING_QUERY_KEYS = {
  all: ["bookings"] as const,
  list: (params: GetBookingsParams) =>
    [...BOOKING_QUERY_KEYS.all, "list", params] as const,
};

export const useGetBookings = (params: GetBookingsParams = {}) => {
  const api = useAxios();

  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.bookingStatus)
        searchParams.set("bookingStatus", params.bookingStatus);
      if (params.projectId) searchParams.set("projectId", params.projectId);
      if (params.blockId) searchParams.set("blockId", params.blockId);
      if (params.startDate) searchParams.set("startDate", params.startDate);
      if (params.endDate) searchParams.set("endDate", params.endDate);

      const queryString = searchParams.toString();
      const url = `/developers/bookings/all${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get<ApiResponse<BookingsResponse>>(url);
      return response.data.data;
    },
  });
};
