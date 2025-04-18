'use client';
import { useState, useEffect } from "react";
import { Car } from "@/types/Car";

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
            setFormData((prev) => ({ ...prev, image: [...prev.image, base64] }));
            setLoading(false);
            setLoading(false);
        };
    };

    const onDelete = (id: string) => {
        setFormData((prev) => ({ ...prev, image: prev.image.filter((img) => img !== id) }));
    };


    useEffect(() => {
            setImageIds(formData.image);
    }, [formData.image.length]);
    return (
        <div style={{ textAlign: "center", padding: 20 }}>
            {
                imageIds.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "row", justifyContent:"center", overflowX: "auto", gap: "10px" }}>
                            {
                                imageIds.map((img, index) => (
                                    <EachImage key={index} img={img} deleteFunc={() => onDelete(img.toString())} />
                                ))
                            }          
                        </div>
                ) : (
                    <p>No Image Upload</p>
                )
            }
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

const EachImage = ({ img, deleteFunc }: { img: string, deleteFunc?: () => void }) => {
    return (
        <div style={{ position: "relative", margin: "0 auto" }}>
            {
                deleteFunc && (
                    <div onClick={deleteFunc} style={{ position: "absolute", top: 0, right: 0, cursor: "pointer", padding: "5px", backgroundColor: "red", color: "white" }}>
                        x
                    </div>
                )
            }
            <img src={img} style={{ width: "auto", height: "100px", objectFit: "cover" }} />
        </div>
    );
};