import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: API_BASE_URL.replace('/api', ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type EnhancementType = 'improve' | 'shorten' | 'professional' | 'friendly' | 'translate';

interface EnhanceTextResponse {
  original: string;
  enhanced: string;
  type: string;
}

export const useAITextEnhancement = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceText = async (
    text: string,
    type: EnhancementType = 'improve'
  ): Promise<string | null> => {
    if (!text || !text.trim()) {
      toast.error('Please enter some text first');
      return null;
    }

    setIsEnhancing(true);

    try {
      const response = await api.post<EnhanceTextResponse>('/api/utils/enhance-text/', {
        text,
        type,
      });

      toast.success('Text enhanced successfully');
      return response.data.enhanced;
    } catch (error: any) {
      console.error('Failed to enhance text:', error);
      const errorMessage = error.response?.data?.error || 'Failed to enhance text';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    enhanceText,
    isEnhancing,
  };
};
