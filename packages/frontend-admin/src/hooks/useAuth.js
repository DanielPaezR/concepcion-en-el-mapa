import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    api.get('/auth/verificar')
      .then(response => {
        setUser(response.data.usuario);
      })
      .catch(() => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    setLoading(true); // ← Mostrar loading mientras se loguea
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(usuario);
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error al iniciar sesión' };
    } finally {
      setLoading(false); // ← Ocultar loading después
    }
  };

  const logout = () => {
    setLoading(true); // ← Mostrar loading mientras cierra sesión
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setLoading(false); // ← Ocultar loading después
  };

  
  return { user, loading, login, logout };
};