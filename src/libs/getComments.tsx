
export default async function getComments(id : string) {
    const res = await fetch(`http://localhost:5000/api/v1/cars/${id}/comments`)
    if(!res.ok){
        console.log(id)
        throw new Error("Failed to fetch car")
    }
    return await res.json()
} 