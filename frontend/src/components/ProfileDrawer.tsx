import { useState } from 'react';
import '../dashboard.css';

type Props = {
  user: any;
  onClose: () => void;
};

export default function ProfileDrawer({ user, onClose }: Props) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [cell, setCell] = useState(user.cell);
  const handleChangePassword=()=>alert('Fluxo de troca de senha em desenvolvimento');

  return (
    <div className="profile-drawer">
      <button className="close-btn" onClick={onClose}>×</button>
      <h3>Meu Perfil</h3>
      <img src={user.avatar} className="avatar" />
      <form>
        <label className="full">
          E-mail
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="full">
          Nome completo
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="full">
          Telefone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="full">
          Celular
          <input value={cell} onChange={(e) => setCell(e.target.value)} />
        </label>

        <h4 className="full" style={{ marginTop: '1rem' }}>Alterar senha</h4>
        <label className="full">
          Senha atual
          <input type="password" />
        </label>
        <label className="full">
          Nova senha
          <input type="password" />
        </label>
        <label className="full">
          Confirmar nova senha
          <input type="password" />
        </label>

        <button className="full btn primary" type="button" style={{ marginTop: '0.5rem' }}>
          Salvar
        </button>
      </form>
    </div>
  );
}
