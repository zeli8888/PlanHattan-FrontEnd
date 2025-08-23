import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_PLANHATTAN_API_BASE_URL + '/user';

export const getUserProfile = async () => {
    try {
        const csrfToken = sessionStorage.getItem('csrfToken');

        if (!csrfToken) {
            throw new Error('CSRF token not found in sessionStorage');
        }

        console.log(csrfToken)
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        };

        const response = await axios({
            method: 'GET',
            url: API_BASE_URL,
            headers: headers,
            withCredentials: true
        });

        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
export const updateUserProfile = async (userData) => {
    try {

        const csrfToken = sessionStorage.getItem('csrfToken');

        if (!csrfToken) {
            throw new Error('CSRF token not found in sessionStorage');
        }

        const rawBody = JSON.stringify(userData);

        console.log('Request:', {
            method: 'PUT',
            url: API_BASE_URL,
            rawBody: rawBody,
            data: userData
        });


        const response = await axios({
            method: 'PUT',
            url: API_BASE_URL,
            data: rawBody,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            withCredentials: true

        });

        console.log('Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });

        return response.data;
    } catch (error) {
        console.error('API Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        throw error;
    }
};

export const uploadUserPicture = async (file, password = '123') => {
    try {
        const csrfToken = sessionStorage.getItem('csrfToken');

        if (!csrfToken) {
            throw new Error('CSRF token not found in sessionStorage');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        console.log('Uploading picture:', {
            fileName: file.name,
            fileSize: file.size,
            password: password
        });

        const response = await axios({
            method: 'POST',
            url: `${API_BASE_URL}/picture`,
            data: formData,
            headers: {
                'X-CSRF-TOKEN': csrfToken
                // Don't set Content-Type for FormData, let axios set it automatically
            },
            withCredentials: true
        });

        console.log('Picture upload response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });

        return response.data;
    } catch (error) {
        console.error('Picture upload API Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        throw error;
    }
};

export const deleteUserProfile = async () => {
    try {
        const csrfToken = sessionStorage.getItem('csrfToken');

        if (!csrfToken) {
            throw new Error('CSRF token not found in sessionStorage');
        }

        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        };

        const response = await axios({
            method: 'DELETE',
            url: API_BASE_URL,
            headers: headers,
            withCredentials: true
        });

        // Clear session storage after successful deletion
        sessionStorage.clear();
        // OR if you want to clear specific items:
        // sessionStorage.removeItem('csrfToken');
        // sessionStorage.removeItem('user');

        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};