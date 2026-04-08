// utils/uploadImage.js

import { API_PATHS } from './apiPaths';
import axiosInstance from './axiosInstance';

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile); // Make sure 'image' matches your backend field name

  try {
    const response = await axiosInstance.post(
      API_PATHS.IMAGE.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data; // Return response from backend
  } catch (error) {
    console.error('Error uploading the image:', error);
    throw error;
  }
};

export default uploadImage;
