import axios from 'axios';

export const fetchZoneBusyness = async () => {
    try {
        // Get current datetime in UTC format
        const currentDateTime = new Date().toISOString();
        
        const response = await axios.get('https://planhattan.ddns.net/api/zones', {
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if needed
                // 'Authorization': `Bearer ${userStorage.getToken()}`
            },
            params: {
                dateTime: currentDateTime
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching zone busyness data:', error);
        throw error;
    }
};