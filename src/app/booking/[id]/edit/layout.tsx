import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Booking - Car Rental',
  description: 'Edit your car rental booking',
};

export default function EditBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </main>
  );
}
