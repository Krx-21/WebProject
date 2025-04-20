import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Rental - Booking',
  description: 'Book your car rental',
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {children}
    </main>
  );
}