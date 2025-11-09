import { Annotation } from '../types/annotation';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || '';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const annotationService = {
  async getAll(): Promise<Annotation[]> {
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
      throw error;
    }
  },

  async create(x: number, y: number, z: number, text: string): Promise<Annotation> {
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
