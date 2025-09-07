import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import InfoCards from '../components/InfoCards';

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setError('E-mail inválido');
      return;
    }
    if (password.length < 6) {
      setError('Senha deve ter ao menos 6 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Login', { email, password });
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <InfoCards />
      </div>
      <div className="auth-container">
        <h2 style={{ margin: 0, marginBottom: '1rem', color: '#00c853' }}>MediSync</h2>
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            E-mail
            <div className="input-icon-wrapper">
              <FiMail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>
          <label>
            Senha
            <div className="input-icon-wrapper" style={{ position: 'relative' }}>
              <FiLock />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <div className="row-between">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input type="checkbox" style={{ accentColor: '#00c853' }} /> Lembrar-me
            </label>
            <a href="#">Esqueci a senha</a>
          </div>
          {error && <p style={{ color: '#ff5252', margin: 0 }} aria-live="polite">{error}</p>}
          <button type="submit" style={{ marginTop: '0.5rem' }} className={loading ? 'btn-loading' : ''}>Entrar</button>
        </form>
        <p>
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
