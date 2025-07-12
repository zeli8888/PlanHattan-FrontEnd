import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function GoogleCallback() {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: csrfResult } = await axios.get('https://planhattan.ddns.net/api/csrf-token', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    withCredentials: true, // Include cookies for authentication
                });
                if (!csrfResult.token) {
                    console.warn('CSRF token fetch failed, Please login first.');
                    return navigate('/signin');
                }

                const { data: user } = await axios.get('https://planhattan.ddns.net/api/user', {
                    headers: {
                        'X-CSRF-TOKEN': csrfResult.token,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                });

                if (!user.userName && !user.email) {
                    console.warn('User info fetch failed, Please try again.');
                    return navigate('/signin');
                }

                const userData = {
                    username: user.userName || user.email,
                    ...user
                };

                login(userData, csrfResult.token);
                console.log('Google Login successfully verified with CSRF token');
                navigate("/my-plans");

            } catch (error) {
                console.error('Error while verifying Google login: ', error);
                return navigate('/signin');
            }
        };

        fetchUserData();
    }, [navigate, login]);

    return (
        <div className="p-4 text-center">
            <span className="animate-pulse">Verifying Google Login...</span>
        </div>
    );
}