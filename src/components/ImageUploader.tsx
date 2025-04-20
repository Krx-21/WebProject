'use client';
import { useState, useEffect } from "react";
import { Car } from "@/types/Car";
import Image from "next/image";
import { compressImage, blobToBase64 } from "@/lib/imageUtils";

type FormData = Omit<Car, '_id' | '__v' | 'id' | 'postedDate'>;

interface ImageUploaderProps {
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  formData: FormData;
}

export default function ImageUploader({ setFormData, formData }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      return alert("Please choose an image!");
    }

    if (formData.image.length >= 5) {
      return alert("Maximum 5 images allowed!");
    }

    setLoading(true);

    try {
      if (!file.type.startsWith('image/')) {
        setLoading(false);
        return alert("Only image files are allowed!");
      }

      const compressedImage = await compressImage(file, 10, 0.8);

      const base64 = await blobToBase64(compressedImage);

      setFormData((prev) => ({ ...prev, image: [...prev.image, base64] }));
      setFile(null);
    } catch (error) {
      console.error('Error processing image:', error);
      alert("Failed to process image. Please try a different image or a smaller file.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = (id: string) => {
    setFormData((prev) => ({ ...prev, image: prev.image.filter((img) => img !== id) }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      if (!droppedFile.type.startsWith('image/')) {
        alert("Only image files are allowed!");
        return;
      }

      const fileSizeInMB = droppedFile.size / 1024 / 1024;
      if (fileSizeInMB > 10) {
        const proceed = window.confirm(
          `This image is ${fileSizeInMB.toFixed(1)}MB which exceeds the 10MB limit. ` +
          `It will be compressed before uploading, which may reduce quality. ` +
          `Continue with this image?`
        );

        if (!proceed) return;
      } else if (fileSizeInMB > 5) {
        console.log(`Image size: ${fileSizeInMB.toFixed(1)}MB - may be compressed if needed`);
      }

      setFile(droppedFile);
    }
  };

  useEffect(() => {
    setImageIds(formData.image);
  }, [formData.image.length]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Car Images
      </label>

      {/* Image Preview */}
      <div className="mb-4">
        {imageIds.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-start">
            {imageIds.map((img, index) => (
              <div key={index} className="relative group">
                <div className="h-32 w-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Car image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(img.toString())}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm italic">
            No images uploaded yet. Upload up to 5 images.
          </div>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-gray-700 dark:text-gray-300 font-medium">
            {file ? file.name : 'Drag & drop an image here, or click to select'}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Supports: JPG, PNG, GIF (Max size: 10MB)
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">
            Images larger than 10MB will be automatically compressed to improve performance
          </div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              if (selectedFile) {
                const fileSizeInMB = selectedFile.size / 1024 / 1024;
                if (fileSizeInMB > 10) {
                  const proceed = window.confirm(
                    `This image is ${fileSizeInMB.toFixed(1)}MB which exceeds the 10MB limit. ` +
                    `It will be compressed before uploading, which may reduce quality. ` +
                    `Continue with this image?`
                  );

                  if (!proceed) return;
                } else if (fileSizeInMB > 5) {
                  console.log(`Image size: ${fileSizeInMB.toFixed(1)}MB - may be compressed if needed`);
                }
              }
              setFile(selectedFile);
            }}
            accept="image/*"
          />
          <label
            htmlFor="file-upload"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 cursor-pointer"
          >
            Select Image
          </label>
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2 ${
            !file || loading
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Image</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
