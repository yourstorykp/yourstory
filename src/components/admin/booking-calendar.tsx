"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type CalBooking = {
  id: number;
  startDate: string;
  code: string;
  customerName: string;
};

// Helpers
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export function BookingCalendar({ bookings }: { bookings: CalBooking[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Create array of empty slots for first row
  const blanks = Array(firstDay).fill(null);
  
  // Create array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group bookings by date string (YYYY-MM-DD)
  const bookingsByDate: Record<string, CalBooking[]> = {};
  bookings.forEach((b) => {
    if (!b.startDate) return;
    const d = new Date(b.startDate);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!bookingsByDate[dateStr]) bookingsByDate[dateStr] = [];
    bookingsByDate[dateStr].push(b);
  });

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookingsByDate[dateStr] || [];
  };

  const selectedDateStr = selectedDate 
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;
    
  const selectedBookings = selectedDateStr ? bookingsByDate[selectedDateStr] || [] : [];

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-heading text-lg font-semibold">Kalender Booking</CardTitle>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium w-24 text-center">
            {currentDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
          </div>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
          <div>Min</div>
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-8 rounded-md" />
          ))}
          {days.map((day) => {
            const dayBookings = getBookingsForDay(day);
            const hasBooking = dayBookings.length > 0;
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`relative flex h-8 w-full flex-col items-center justify-center rounded-md text-sm transition-colors hover:bg-muted ${
                  isSelected ? "bg-forest text-primary-foreground hover:bg-forest-deep" : ""
                } ${isToday && !isSelected ? "border border-forest font-bold text-forest" : ""}`}
              >
                <span>{day}</span>
                {hasBooking && !isSelected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-terracotta" />
                )}
                {hasBooking && isSelected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-2">
              {selectedDate.toLocaleString('id-ID', { dateStyle: 'full' })}
            </h4>
            {selectedBookings.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tidak ada booking baru di tanggal ini.</p>
            ) : (
              <ul className="space-y-2">
                {selectedBookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-2 text-sm">
                    <div>
                      <div className="font-medium">{b.code}</div>
                      <div className="text-xs text-muted-foreground">{b.customerName}</div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="h-7 text-xs">
                      <Link href={`/admin/bookings/${b.id}`}>Detail</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
