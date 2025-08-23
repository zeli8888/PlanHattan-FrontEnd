// DeleteUserPlansApi.js
const deleteUserPlans = async (userPlanId) => {
  try {
    const csrfToken = sessionStorage.getItem('csrfToken');

    if (!csrfToken) {
      throw new Error('CSRF token not found in localStorage');
    }

    const response = await fetch(import.meta.env.VITE_PLANHATTAN_API_BASE_URL + `/userplans/${userPlanId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      credentials: 'include', // Include cookies for authentication
    });

    console.log('Delete response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Plan with ID ${userPlanId} not found (404)`);
      }
    }

    // 204 No Content means successful deletion
    return { success: true, message: 'Plan deleted successfully' };
  } catch (error) {
    console.error('Error deleting user plan:', error);
    throw error;
  }
};

export default deleteUserPlans;