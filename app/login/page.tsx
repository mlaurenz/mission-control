// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const correctUsername = process.env.NEXT_PUBLIC_MISSION_CONTROL_USERNAME || 'mlaurenz@gmail.com';
    const correctPassword = process.env.NEXT_PUBLIC_MISSION_CONTROL_PASSWORD || 'Idealistas1';
    
    if (username === correctUsername && password === correctPassword) {
      // Set cookie
      document.cookie = 'mission_control_auth=true; path=/; max-age=3600';
      router.push('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <main style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{ 
        padding: '2rem', 
        background: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🚀 Mission Control</h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          {error && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
          )}
          
          <button
            type="submit"
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
