const baseURL = 'https://backend-six-bay-39.vercel.app';
export const getComments = async (id : string) => {

    try {
        const res = await fetch(`${baseURL}/api/v1/cars/${id}/comments`)
        if(!res.ok){
            console.log(id)
            throw new Error("Failed to fetch comment")
        }
        return await res.json()
    }catch (e){
        console.log(`get comment fail ${e}`)
    }


}

export const createComments = async (cid: string, comment: string, rating: number) => {

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return {
              success: false,
              error: 'Authentication required'
            };
        }
        const userData = JSON.parse(userStr);
        const token = userData.token;
        const res = await fetch(`${baseURL}/api/v1/cars/${cid}/comments` ,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                comment: comment,
                rating: rating
            }),
        })
        return await res.json()


    }catch (e){
        console.log(`create comment fail ${e}`)
    }


}

export const editComments = async (id : string , comment: string, rating: number) => {

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return {
              success: false,
              error: 'Authentication required'
            };
        }
        const userData = JSON.parse(userStr);
        const token = userData.token;
        const res = await fetch(`${baseURL}/api/v1/comments/${id}` ,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                comment: comment,
                rating: rating
            }),
        })
        return await res.json()

    }catch (e){
        console.log(`edit comment fail ${e}`)
    }


}

export const deleteComments = async (id : string) => {

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return {
              success: false,
              error: 'Authentication required'
            };
        }
        const userData = JSON.parse(userStr);
        const token = userData.token;
        const res = await fetch(`${baseURL}/api/v1/comments/${id}` ,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${token}`,
            },
        })
        return await res.json()
    }catch (e){
        console.log(`delete comment fail ${e}`)
    }


}