import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f19',
        color: '#e7eaf3',
        fontFamily: 'system-ui',
        fontSize: 18
      }}>
        ⏳ Загрузка...
      </div>
    );
  }

  // Не авторизован — показываем страницы входа/регистрации
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onGoLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onGoRegister={() => setAuthView('register')} />;
  }

  // Авторизован — показываем каталог товаров
  return <ProductsPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;