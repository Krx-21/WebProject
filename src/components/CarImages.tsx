'use client';
import { useState, useEffect } from "react";

interface Image {
    id: number;
    name: string;
    base64: string;
}

export default function CarImages({ images, onDelete}: { images: string[], onDelete?: (id: string) => void }) {
    
    const [allImages, setAllImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchImages = async () => {
        setLoading(true);
        console.log(`/api/getImages?ids=${images}`);
        const res = await fetch(`/api/getImages?ids=${images}`);
        const data: Image[] = await res.json();
        setAllImages(data);
        setLoading(false);
    };

    useEffect(() => {
        if (!images || images.length === 0) {
            setAllImages([]);
            return;
        }
        fetchImages();
    }, [images.length]);


    return (
        <div style={{ marginTop: "30px", display: "flex", flexDirection: "row", justifyContent:"center", alignItems: "center", gap: "10px" }}>   
            {allImages.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "row", overflowX: "auto", gap: "10px" }}>
                    {
                        allImages.map((img, index) => (
                            onDelete ? (
                                <EachImage key={img.id} img={img} deleteFunc={() => onDelete(img.id.toString())}/>
                            ) : (
                                <EachImage key={img.id} img={img}/>
                            )
                        ))
                    }          
                </div>
            ) : (
                loading ? (
                    <p>Loading...</p>
                ) : (
                    <p>No Image Upload</p>
                )
            )}
        </div>
    );

}
const EachImage = ({ img, deleteFunc }: { img: Image, deleteFunc?: () => void }) => {
    return (
        <div style={{ position: "relative", margin: "0 auto" }}>
            {deleteFunc && 
                <div style={{position: "absolute", top: "0", right: "0", cursor: "pointer"}}>
                    <div style={{backgroundColor:"red", color:"white"}} onClick={deleteFunc}>X</div>
                </div>
            }
            <img
                src={img.base64}
                alt={img.name}
                style={{ height: "100px", width: "auto", margin: "0 auto" }}
            />
            <p style={{ fontSize: "12px", marginTop: "5px" }}>{img.name}</p>
        </div>
    );
};