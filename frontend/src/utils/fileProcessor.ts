import { API_BASE_URL } from '../config';

export const processFile = async (file: File): Promise<string> => {
  try {
    let endpoint: string;
    
    if (file.type.startsWith('image/')) {
      endpoint = `${API_BASE_URL}/process-image`;
    } else if (file.type === 'application/pdf') {
      endpoint = `${API_BASE_URL}/extract-pdf-image`;
    } else {
      throw new Error('Unsupported file type. Please upload an image (JPG, PNG, GIF) or PDF file.');
    }

    // Create FormData to send file
    const formData = new FormData();
    formData.append('file', file);

    // Send request to Python backend
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to process file');
    }

    console.log(`Successfully processed ${file.type.startsWith('image/') ? 'image' : 'PDF'}:`, {
      filename: result.original_filename,
      size: result.image_size,
      ...(result.page_count && { pages: result.page_count })
    });

    return result.image_data;

  } catch (error) {
    console.error('File processing error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to the backend server. Please make sure the Python server is running on ${API_BASE_URL}`);
    }
    
    throw error;
  }
};

// Health check function to verify backend connectivity
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};