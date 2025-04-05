'use client';

import PromotionForm from '@/components/PromotionForm';

export default function NewPromotionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Promotion</h1>
      <PromotionForm />
    </div>
  );
} 