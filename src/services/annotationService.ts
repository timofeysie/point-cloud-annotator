import { Annotation } from '../types/annotation';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') || '';
  
  // Check if response is HTML (error page) instead of JSON
  if (contentType.includes('text/html')) {
    const text = await response.text();
    throw new Error(`Received HTML instead of JSON. This usually means the API endpoint is incorrect or not deployed. Response: ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    // Try to parse as JSON, but handle HTML error pages
    try {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    } catch (parseError) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}. Response: ${text.substring(0, 200)}`);
    }
  }

  return response.json();
};

export const annotationService = {
  async getAll(): Promise<Annotation[]> {
    // If API Gateway URL is not configured, return empty array (for local development)
    if (!API_GATEWAY_URL) {
      console.warn('VITE_API_GATEWAY_URL is not set. Annotations will not be loaded. Set this in your .env file.');
      return [];
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/annotations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await handleResponse<Annotation[]>(response);
      // Sort by created_at ascending
      return data.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching annotations:', error);
      // Return empty array on error instead of throwing (graceful degradation)
      return [];
    }
  },

  async create(x: number, y: number, z: number, text: string): Promise<Annotation> {
    if (!API_GATEWAY_URL) {
      throw new Error('VITE_API_GATEWAY_URL is not set. Cannot create annotation.');
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x,
          y,
          z,
          text: text.substring(0, 256),
        }),
      });
      return handleResponse<Annotation>(response);
    } catch (error) {
      console.error('Error creating annotation:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!API_GATEWAY_URL) {
      throw new Error('VITE_API_GATEWAY_URL is not set. Cannot delete annotation.');
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/annotations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting annotation:', error);
      throw error;
    }
  },
};
