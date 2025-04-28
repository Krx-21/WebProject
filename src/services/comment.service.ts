import { API_ENDPOINTS } from "@/config/api";
export const getComments = async (id : string) => {
    try {
        const endpoint = API_ENDPOINTS.comments.getAll(id);
        const response = await fetch(endpoint);
        if(!response.ok){
            throw new Error('We couldn’t load the comments. Please try again later.')
        }
        return await response.json()
    }catch (error){
        return {
            success: false,
            error: error instanceof Error ? error.message: 'An error occurred while loading the comments. Please try again later.'
        };
    }


}

export const createComments = async (id: string, comment: string, rating: number) => {

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return {
              success: false,
              error: 'You need to be logged in to post a comment.'
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
            throw new Error('We couldn’t post your comment. Please try again later.');
        }
        return await response.json()
    }catch (error){
        return {
            success: false,
            error: error instanceof Error ? error.message: 'An error occurred while posting your comment. Please try again later.'
        };
    }


}

export const editComments = async (id : string , comment: string, rating: number) => {

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return {
              success: false,
              error: 'You need to be logged in to edit a comment.'
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
            throw new Error('We couldn’t update your comment. Please try again later.')
        }
        return await response.json()
    }catch (error){
        return {
            success: false,
            error: error instanceof Error ? error.message: 'An error occurred while editing your comment. Please try again later.'
        };
    }


}

export const deleteComments = async (id : string) => {

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            return {
              success: false,
              error: 'You need to be logged in to delete a comment.'
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

        if (response.status == 404) {
            return {
                status: 404,
                success: false
            };
        }

        if (!response.ok) {
            throw new Error('We couldn’t delete your comment. Please try again later.');
        }

        return await response.json()
    }catch (error){
        return {
            success: false,
            error: error instanceof Error ? error.message:'An error occurred while deleting your comment. Please try again later.'
        };
    }


}