'use client';
import { useState, useEffect } from "react";

export default function CarImage({ images }: { images: string[] }) {
    // const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // fetchImages();
    }, []);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
    };

    const currentImage = images[currentIndex];
    // console.log("currentImage:", currentImage);
    return (
        <div style={{ marginTop: "30px", textAlign: "center"}}>
        {images.length > 0 ? (
            <div style={{ position: "relative", width: "300px", margin: "0 auto" }}>
                <div>
                    <img
                        key={currentIndex}
                        src={currentImage}
                        alt={currentIndex.toString()}
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
                </div>
            </div>
        ) : (
            // <img src={"defaultCar.png"} style={{ maxWidth: "100%", maxHeight: "200px", margin: "0 auto" }}/>
            <p>No Image Found</p>
        )}
    </div>
    );

}