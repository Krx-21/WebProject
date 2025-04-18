// 'use client';

export default function CarImageSample({ images }: { images: string[] }) {

    return (
        <div style={{ marginTop: "30px", textAlign: "center"}}>
        {images.length > 0 ? (
            <div style={{ position: "relative", width: "100px", margin: "0 auto" }}>
                <div>
                    <img
                        key={0}
                        src={images[0]}
                        // alt={image.toString()}
                        style={{ maxWidth: "100%", maxHeight: "100px", margin: "0 auto" }}
                    />
                </div>    
            </div>
        ) : (
            <div className="flex justify-center items-center h-48 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No Image Available</p>
            </div>
        )}
        </div>
    );
}

// export default function CarImage({ images }: { images: string[] }) {
//     const [currentIndex, setCurrentIndex] = useState(0);

//     const currentImage = images[currentIndex];
//     // console.log("currentImage:", currentImage);
//     return (
//         <div style={{ marginTop: "30px", textAlign: "center"}}>
//         {images.length > 0 ? (
//             <div style={{ position: "relative", width: "300px", margin: "0 auto" }}>
//                 <div>
//                     <img
//                         key={currentIndex}
//                         src={currentImage}
//                         alt={currentIndex.toString()}
//                         style={{ maxWidth: "100%", maxHeight: "200px", margin: "0 auto" }}
//                     />
//                     <div style={{ position: "relative", marginTop: "10px" }}>
//                         <p style={{ fontSize: "12px", marginTop: "5px" }}>{currentIndex+1}/{images.length}</p>
                        
//                     </div>    
//                 </div>
//             </div>
//         ) : (
//             // <img src={"defaultCar.png"} style={{ maxWidth: "100%", maxHeight: "200px", margin: "0 auto" }}/>
//             <p>No Image Found</p>
//         )}
//     </div>
//     );

// }