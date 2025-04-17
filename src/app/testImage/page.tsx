// 'use client'
// import { useState, useEffect } from "react";

// interface Image {
//     id: number;
//     name: string;
//     base64: string;  // ✅ ใช้ base64 เหมือนเดิม
// }

// export default function Home() {
//     const [file, setFile] = useState<File | null>(null);
//     const [images, setImages] = useState<Image[]>([]);
//     const [loading, setLoading] = useState(false);
//     // const [singleImage, setSingleImage] = useState<Image | null>(null);
//     // const sth = [3,2];
//     // const strs = ["3", "2", "1"];
//     const imageArr = ["3", "2"];

//     const handleUpload = async () => {
//         if (!file) return alert("เลือกไฟล์ก่อน!");
//         setLoading(true);

//         const reader = new FileReader();
//         reader.readAsDataURL(file);
//         reader.onload = async () => {
//             const base64 = reader.result as string;
//             if (!base64.startsWith("data:image")) {
//                 setLoading(false);
//                 return alert("กรุณาอัปโหลดรูปภาพเท่านั้น!");
//             }
//             console.log("Base64:", base64); 
//             await fetch("/api/uploadImage", { 
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ name: file.name, base64 }),
//             });
//             setFile(null);
//             fetchImages();
//         };
//     };

//     const fetchImages = async () => {
//         // console.log(`/api/getImages?ids=${imageArr}`); 
//         const res = await fetch(`/api/getImages?ids=${imageArr}`);
//         const data: Image[] = await res.json();
//         setImages(data);
//         setLoading(false);
//     };

//     useEffect(() => {
//         fetchImages();
//     }, []);

//     return (
//         <div style={{ textAlign: "center", padding: 20 }}>
//             <input 
//                 type="file" 
//                 onChange={(e) => setFile(e.target.files?.[0] || null)} 
//                 accept="image/*"
//             />
//             <button 
//                 onClick={handleUpload} 
//                 disabled={loading} 
//                 style={{ marginLeft: 10, backgroundColor: "blue"}}
//             >
//                 {loading ? "กำลังอัปโหลด..." : "อัปโหลด"}
//             </button>

//             {/* <div style={{ 
//                 display: "grid", 
//                 gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
//                 gap: "10px", 
//                 marginTop: "20px" 
//             }}> */}
//             <div style={{ display: "flex", flexDirection: "row", /* or other layout */ }}>
//                 {images.map((img) => (
//                     <div key={img.id} style={{ textAlign: "center" }}>
//                         <img 
//                             src={img.base64}  // ✅ ใช้ base64 แสดงรูป
//                             alt={img.name} 
//                             style={{ width: "auto", height: "100px"}}
//                         />
//                         <p style={{ fontSize: "12px", marginTop: "5px" }}>{img.name}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

'use client';
import { useState, useEffect } from "react";
import CarImages from "@/components/CarImages";
interface Image {
    id: number;
    name: string;
    base64: string;
}

export default function Home() {
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
                setImageIds((prev) => [...prev, newImageId.toString()]);

            } else {
                console.error("Upload failed:", response.statusText);
            }
            setLoading(false);
        };
    };


    console.log("imageIds:", imageIds);
    return (
        <div style={{ textAlign: "center", padding: 20 }}>
            <CarImages images={imageIds} />
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