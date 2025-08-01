import { useState, useCallback } from 'react';
import ApiService from '../services/api';
import { FILE_CONFIG, MESSAGES } from '../utils/constants';

/**
 * Custom hook for file upload and processing
 */
export const useFileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file) => {
    if (!file) {
      throw new Error('No file selected');
    }

    // Check file size
    if (file.size > FILE_CONFIG.maxSize) {
      throw new Error(MESSAGES.fileSizeError);
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_CONFIG.allowedTypes.some(type => 
      fileName.endsWith(type)
    );

    if (!hasValidExtension) {
      throw new Error(MESSAGES.fileTypeError);
    }

    return true;
  }, []);

  /**
   * Upload and process file
   */
  const uploadFile = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);

      validateFile(file);
      
      const result = await ApiService.uploadFile(file);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || MESSAGES.uploadError);
      }
    } catch (err) {
      const errorMessage = err.message || MESSAGES.uploadError;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateFile]);

  /**
   * Process fixed file
   */
  const processFixedFile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ApiService.processFixedFile();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || MESSAGES.processingError);
      }
    } catch (err) {
      const errorMessage = err.message || MESSAGES.processingError;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      return await uploadFile(file);
    }
  }, [uploadFile]);

  /**
   * Handle file input change
   */
  const handleFileInput = useCallback(async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      return await uploadFile(file);
    }
  }, [uploadFile]);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setDragActive(false);
  }, []);

  return {
    loading,
    error,
    dragActive,
    uploadFile,
    processFixedFile,
    handleDrag,
    handleDrop,
    handleFileInput,
    validateFile,
    reset
  };
};
