'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { RentalCarProvider } from '@/types/rcp';
import { createRcp, updateRcp, deleteRcp } from '@/services/rcp.service';

interface RcpManagementProps {
  providers: RentalCarProvider[];
  refreshProviders: () => Promise<void>;
  setError: (error: string) => void;
}

export default function RcpManagement({ providers, refreshProviders, setError }: RcpManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<RentalCarProvider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    district: '',  
    province: '',
    postalcode: '', 
    tel: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      district: '',  
      province: '',
      postalcode: '',
      tel: ''
    });
    setEditingProvider(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (provider: RentalCarProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      address: provider.address,
      district: provider.district || '', 
      province: provider.province || '',
      postalcode: provider.postalcode || '', 
      tel: provider.tel || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) return;

    try {
      const response = await deleteRcp(id);
      if (response.success) {
        await refreshProviders();
      } else {
        setError(response.error || 'Failed to delete provider');
      }
    } catch (err) {
      console.error('Delete provider error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      
      if (editingProvider) {
        response = await updateRcp(editingProvider._id, formData);
      } else {
        response = await createRcp(formData);
      }

      if (response.success) {
        await refreshProviders();
        setShowForm(false);
        resetForm();
      } else {
        setError(response.error || 'Failed to save provider');
      }
    } catch (err) {
      console.error('Provider form error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rental Car Providers</h2>
        
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Provider
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingProvider ? 'Edit Provider' : 'Add New Provider'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Provider Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Postal Code</label>
                <input
                  type="text"
                  name="postalcode"
                  value={formData.postalcode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Contact Number</label>
                <input
                  type="tel"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingProvider ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {providers.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">No providers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <div key={provider._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{provider.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(provider)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(provider._id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{provider.address}</p>
              {provider.district && (
                <p className="text-gray-600 dark:text-gray-400">District: {provider.district}</p>
              )}
              {provider.province && (
                <p className="text-gray-600 dark:text-gray-400">Province: {provider.province}</p>
              )}
              {provider.postalcode && (
                <p className="text-gray-600 dark:text-gray-400">Postal Code: {provider.postalcode}</p>
              )}
              {provider.tel && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">Tel: {provider.tel}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}