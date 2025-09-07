import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InfoCards from '../components/InfoCards';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

const strength = (pwd:string)=>{
  if(pwd.length>8 && /[A-Z]/.test(pwd) && /\d/.test(pwd)) return 'strong';
  if(pwd.length>=6) return 'medium';
  return 'weak';
};

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [strengthLevel,setStrength]=useState<'weak'|'medium'|'strong'>('weak');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  useEffect(()=>{ setStrength(strength(password));},[password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      alert('As senhas não coincidem');
      return;
    }
    // TODO: Integrate with backend API
    console.log('Register', { name, email, password });
  };

  return (
    <div className="auth-page">
      <div className="hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <InfoCards />
      </div>
      <div className="auth-container">
        <h2 style={{ margin: 0, marginBottom: '1rem', color: '#00c853' }}>MediSync</h2>
        <h1>Cadastrar</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nome completo
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirmar senha
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>
          <button type="submit" style={{ marginTop: '0.5rem' }}>Criar conta</button>
        </form>
        <p>
          Já possui conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
