import { API_ENDPOINTS } from "@/config/api";
export const getComments = async (id : string) => {
    try {
        const endpoint = API_ENDPOINTS.comments.getAll(id);
        const response = await fetch(endpoint);
        if(!response.ok){
            throw new Error('Failed to load comments')
        }
        return await response.json()
    }catch (error: any){
        return {
            success: false,
            error: 'Failed to load comments'
        };
    }


}

export const createComments = async (id: string, comment: string, rating: number) => {

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

        const endpoint = API_ENDPOINTS.comments.create(id);
        const response = await fetch(endpoint ,{
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
        if(!response.ok){
            throw new Error('Failed to create comments')
        }
        return await response.json()
    }catch (error: any){
        return {
            success: false,
            error: 'Failed to create comments'
        };
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

        const endpoint = API_ENDPOINTS.comments.update(id);
        const response = await fetch(endpoint ,{
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
        if(!response.ok){
            throw new Error('Failed to create comments')
        }
        return await response.json()
    }catch (error: any){
        return {
            success: false,
            error: 'Failed to edit comments'
        };
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

        const endpoint = API_ENDPOINTS.comments.delete(id)
        const response = await fetch(endpoint ,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${token}`,
            },
        })
        return await response.json()
    }catch (e){
        console.log(`delete comment fail ${e}`)
    }


}