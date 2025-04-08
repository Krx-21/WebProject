'use client';

import PromotionForm from '@/components/PromotionForm';

export default function NewPromotionPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
      <div className="container-base max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm
                     border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 
                       bg-clip-text text-transparent">
            Create New Promotion
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details below to create a new promotion
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                     border border-gray-200 dark:border-gray-700
                     hover:shadow-xl transition-all duration-200">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Promotion Details
            </h2>
          </div>
          
          <div className="p-6">
            <PromotionForm />
          </div>
        </div>
      </div>
    </div>
  );
}