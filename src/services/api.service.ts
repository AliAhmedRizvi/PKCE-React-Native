export const callApi = async (token: string): Promise<any> => {
  // Replace with your actual backend API URL
  const API_URL = 'http://10.0.2.2:5000/api/protected-resource';

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
