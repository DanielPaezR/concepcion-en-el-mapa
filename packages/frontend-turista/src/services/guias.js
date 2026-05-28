import api from './api';

export const getPublicGuideAvatars = async () => {
  return api.get('/public/avatares-guias');
};
