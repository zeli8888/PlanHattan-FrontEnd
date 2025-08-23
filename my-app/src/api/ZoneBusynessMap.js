import axios from 'axios';

export const fetchZoneBusyness = async () => {
    try {
        // Get current datetime in UTC format
        const currentDateTime = new Date().toISOString();
        const response = await axios.get(import.meta.env.VITE_PLANHATTAN_API_BASE_URL + '/zones', {
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if needed
                // 'Authorization': `Bearer ${userStorage.getToken()}`
            },
            params: {
                dateTime: currentDateTime
            }
        });
        // console.log(response.data, 'in api')
        return response.data;
    } catch (error) {
        console.error('Error fetching zone busyness data:', error);
        throw error;
    }
};