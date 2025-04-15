const BASE_URL = 'http://localhost:5000/api/v1';

export const getCarsForProvider = async (providerId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/rentalCarProviders/${providerId}/cars`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cars'
    };
  }
};

export const getAllCars = async () => {
  try {
    const response = await fetch(`${BASE_URL}/cars`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cars'
    };
  }
};

export const getCarById = async (carId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/cars/${carId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching car:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch car'
    };
  }
};
