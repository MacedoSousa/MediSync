import React, { useMemo, useState } from 'react'

const apiBase = '/api'

async function postJson(path, body){
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

export default function App(){
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const title = useMemo(() => tab === 'login' ? 'Login' : 'Cadastro', [tab])

  async function handleSubmit(e){
    e.preventDefault()
    setMessage('')
    setSuccess(false)

    const payload = {
      action: tab === 'login' ? 'login' : 'register',
      username, password, empresa
    }
    const res = await postJson('/acesso.php', payload)
    const ok = !!res?.success
    const msg = res?.message || (ok ? 'Sucesso' : 'Falha')
    setMessage(msg)
    setSuccess(ok)
    if (ok && tab === 'register'){
      setTab('login')
      setPassword('')
    }
  }

  return (
    <div className="container">
      <h1>MediSync</h1>
      <p className="desc">Acesse sua conta ou cadastre-se</p>

      <div className="tabs">
        <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</button>
        <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Cadastro</button>
      </div>

      {message && (
        <div className={`msg ${success ? 'success' : 'error'}`}>{message}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label>Usuário ou E-mail</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="seuusuario ou voce@exemplo.com" />
        </div>
        <div>
          <label>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" />
          {tab === 'register' && <div className="hint">Mínimo de 6 caracteres e pelo menos um número.</div>}
        </div>
        {tab === 'register' && (
          <div>
            <label>Empresa (opcional)</label>
            <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Onde você trabalha" />
          </div>
        )}
        <button type="submit">{tab === 'login' ? 'Entrar' : 'Cadastrar'}</button>
      </form>

      <p className="muted">Protótipo React consumindo o endpoint PHP.</p>
    </div>
  )
}



