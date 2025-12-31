"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetBookings } from "@/hooks/useBookings";
import { Loader2 } from "lucide-react";

const BookingsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError } = useGetBookings({ page, limit });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-500">Error loading bookings</div>;
  }

  const { bookings, pagination } = data || {};
  const totalPages = pagination?.totalPages || 0;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Plot</TableHead>
                {/* <TableHead>Status</TableHead> */}
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <div className="font-medium">
                      {booking.customerDetails.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.customerDetails.phone}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.customerDetails.email}
                    </div>
                  </TableCell>
                  <TableCell>{booking.projectId.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {booking.plotId.plotNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.plotId.area} {booking.plotId.areaUnit}
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    <Badge
                      variant={
                        booking.bookingStatus === "confirmed"
                          ? "default"
                          : booking.bookingStatus === "pending"
                          ? "secondary"
                          : booking.bookingStatus === "cancelled"
                          ? "destructive"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {booking.bookingStatus}
                    </Badge>
                  </TableCell> */}
                  <TableCell>
                    {format(new Date(booking.bookingDate), "PP")}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(booking.plotId.price)}
                  </TableCell>
                </TableRow>
              ))}
              {!bookings?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <PaginationItem key={pageNum}>
                          <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsPage;
