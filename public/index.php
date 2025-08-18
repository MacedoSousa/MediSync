<?php

require_once __DIR__ . '/api/acesso.php';

$action = isset($_GET['action']) ? strtolower((string) $_GET['action']) : 'login';
$action = in_array($action, ['login', 'register'], true) ? $action : 'login';

$message = '';
$registered = isset($_GET['registered']) ? (string) $_GET['registered'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? (string) $_POST['username'] : '';
    $password = isset($_POST['password']) ? (string) $_POST['password'] : '';
    $empresa  = isset($_POST['empresa']) ? (string) $_POST['empresa'] : '';

    $dados = [
        'username' => $username,
        'psswrd'   => $password,
        'empresa'  => $empresa,
    ];

    $acesso = new Inicializacao();

    // Suprimir mensagens internas para permitir redirecionamento
    ob_start();
    if ($action === 'register') {
        $ok = $acesso->Inicio('CADASTRAR', $dados);
    } else {
        $ok = $acesso->Inicio('LOGIN', $dados);
    }
    $internalOutput = trim(ob_get_clean());

    if ($action === 'register') {
        if ($ok) {
            header('Location: /index.php?action=login&registered=1');
            exit;
        }
        $message = $internalOutput !== '' ? $internalOutput : 'Falha no cadastro.';
    } else {
        if ($ok) {
            $message = 'Login efetuado com sucesso.';
        } else {
            $message = $internalOutput !== '' ? $internalOutput : 'Falha no login.';
        }
    }
}

?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MediSync - <?php echo $action === 'register' ? 'Cadastro' : 'Login'; ?></title>
    <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background: #0f172a; color: #e5e7eb; margin: 0; }
        .container { max-width: 420px; margin: 8vh auto; background: #111827; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,.35); }
        h1 { margin: 0 0 8px; font-size: 20px; }
        p.desc { margin: 0 0 16px; color: #9ca3af; font-size: 14px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .tab { flex: 1; text-align: center; padding: 10px 12px; border-radius: 8px; background: #1f2937; color: #9ca3af; text-decoration: none; }
        .tab.active { background: #2563eb; color: #fff; }
        form { display: grid; gap: 12px; }
        label { font-size: 13px; color: #cbd5e1; }
        input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #374151; background: #0b1220; color: #e5e7eb; }
        button { padding: 10px 12px; border: 0; border-radius: 8px; background: #22c55e; color: #052e16; font-weight: 600; cursor: pointer; }
        .muted { font-size: 12px; color: #9ca3af; }
        .msg { background: #0b1220; border: 1px solid #374151; color: #e5e7eb; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; white-space: pre-line; }
        .success { border-color: #16a34a; }
        .error { border-color: #dc2626; }
        .hint { font-size: 12px; color: #94a3b8; }
    </style>
    <meta name="color-scheme" content="dark light">
</head>
<body>
    <div class="container">
        <h1>MediSync</h1>
        <p class="desc">Acesse sua conta ou cadastre-se</p>

        <div class="tabs">
            <a class="tab <?php echo $action === 'login' ? 'active' : ''; ?>" href="/index.php?action=login">Login</a>
            <a class="tab <?php echo $action === 'register' ? 'active' : ''; ?>" href="/index.php?action=register">Cadastro</a>
        </div>

        <?php if ($registered === '1' && $action === 'login') { ?>
            <div class="msg success">Cadastro realizado com sucesso. Faça seu login.</div>
        <?php } ?>

        <?php if (!empty($message)) { ?>
            <div class="msg <?php echo strpos(strtolower($message), 'sucesso') !== false ? 'success' : 'error'; ?>"><?php echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php } ?>

        <?php if ($action === 'register') { ?>
            <form method="post" action="/index.php?action=register" novalidate>
                <div>
                    <label for="username">Usuário ou E-mail</label>
                    <input type="text" id="username" name="username" placeholder="seu usuario ou voce@exemplo.com" required />
                    <div class="hint">Mínimo de 3 caracteres ou e-mail válido.</div>
                </div>
                <div>
                    <label for="password">Senha</label>
                    <input type="password" id="password" name="password" placeholder="Sua senha" required />
                    <div class="hint">Mínimo de 6 caracteres e pelo menos um número.</div>
                </div>
                <div>
                    <label for="empresa">Empresa (opcional)</label>
                    <input type="text" id="empresa" name="empresa" placeholder="Onde você trabalha" />
                </div>
                <button type="submit">Cadastrar</button>
            </form>
        <?php } else { ?>
            <form method="post" action="/index.php?action=login" novalidate>
                <div>
                    <label for="username">Usuário ou E-mail</label>
                    <input type="text" id="username" name="username" placeholder="seu usuario ou voce@exemplo.com" required />
                </div>
                <div>
                    <label for="password">Senha</label>
                    <input type="password" id="password" name="password" placeholder="Sua senha" required />
                </div>
                <button type="submit">Entrar</button>
            </form>
        <?php } ?>

        <p class="muted" style="margin-top:16px;">Este é um protótipo simples de rota. Validações e persistência real serão adicionadas.</p>
    </div>
</body>
</html>



