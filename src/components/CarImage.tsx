'use client';
import { useState, useEffect } from "react";

interface Image {
    id: number;
    name: string;
    base64: string;
}

export default function CarImage({ images }: { images: string[] }) {
    const [allImages, setAllImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchImages = async () => {
        const res = await fetch(`/api/getImages?ids=${images}`);
        const data: Image[] = await res.json();
        setAllImages(data);
        setLoading(false);
        setCurrentIndex(0);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
    };

    const currentImage = allImages[currentIndex];

    return (
        <div style={{ marginTop: "30px", textAlign: "center"}}>
        {allImages.length > 0 ? (
            <div style={{ position: "relative", width: "300px", margin: "0 auto" }}>
                
                <div>
                    {currentImage && (
                        <>
                            <img
                                key={currentImage.id}
                                src={currentImage.base64}
                                alt={currentImage.name}
                                style={{ maxWidth: "100%", maxHeight: "200px", margin: "0 auto" }}
                            />
                            <div style={{ position: "relative", marginTop: "10px" }}>
                                <button
                                    onClick={goToPrevious}
                                    style={{
                                        position: "absolute",
                                        left: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        fontSize: "20px",
                                        cursor: "pointer",
                                    }}
                                >
                                    &lt;
                                </button>   
                                <p style={{ fontSize: "12px", marginTop: "5px" }}>{currentIndex+1}/{images.length}</p>
                                <button
                                    onClick={goToNext}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        fontSize: "20px",
                                        cursor: "pointer",
                                    }}
                                >
                                    &gt;
                                </button>
                            </div>    
                        </>
                    )}
                </div>
                
            </div>
        ) : (
            // <img src={"defaultCar.png"} style={{ maxWidth: "100%", maxHeight: "200px", margin: "0 auto" }}/>
            <p>No Image Found</p>
        )}
    </div>
    );

}