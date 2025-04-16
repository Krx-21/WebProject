'use client';
import { useState, useEffect } from "react";
import CarImages from "@/components/CarImages";
import { Car } from "@/types/Car";

interface Image {
    id: number;
    name: string;
    base64: string;
}

type FormData = Omit<Car, '_id' | '__v' | 'id' | 'postedDate'>;

interface LoadImageProps {
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    formData: FormData;
}

export default function LoadingImage({ setFormData, formData }: LoadImageProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageIds, setImageIds] = useState<string[]>([]);

    const handleUpload = async () => {
        if (!file) return alert("please choose image!");
        setLoading(true);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string; 
            if (!base64.startsWith("data:image")) {
                setLoading(false);
                return alert("only image!");
            }
            const response = await fetch("/api/uploadImage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: file.name, base64 }),
            });

            if (response.ok) {
                const result = await response.json();
                const newImageId = result.data[0]?.id;
                setFile(null);
                setFormData((prev) => ({ ...prev, image: [...prev.image, newImageId.toString()] }));
            } else {
                console.error("Upload failed:", response.statusText);
            }
            setLoading(false);
        };
    };

    const handleDelete = (id: string) => {
        setFormData((prev) => ({ ...prev, image: prev.image.filter((img) => img !== id) }));
    };    


    // console.log("imageIds:", imageIds);
    useEffect(() => {
            // console.log("formData.image:", formData.image);
            setImageIds(formData.image);
    }, [formData.image.length]);
    return (
        <div style={{ textAlign: "center", padding: 20 }}>
            <CarImages images={imageIds} onDelete={handleDelete} />
            <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*"
            style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: 'red',
                cursor: 'pointer',
                fontSize: '16px',
                width: 'auto',
            }}
            />
            <button
                onClick={handleUpload}
                disabled={loading}
                style={{ marginLeft: 10, backgroundColor: "blue", color: "white", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}
            >
                {loading ? "loading..." : "upload"}
            </button>
        </div>
    );
}