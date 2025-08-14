<?php

class Inicializacao{

    public function Inicio($tipo, $dados){
        $mensagem = new RetornosPersonalizados();

        $tipoNormalizado = strtoupper((string) $tipo);

        if ($tipoNormalizado === "CADASTRAR" || $tipoNormalizado === "CADASTRO" || $tipoNormalizado === "1" || $tipoNormalizado === "CADASTRA"){
            return $this->Cadastro($dados, $mensagem);
        }

        if ($tipoNormalizado === "LOGIN" || $tipoNormalizado === "2") {
            return $this->Login($dados, $mensagem);
        }

        $mensagem->MensagemRetorno("Opção inválida.\n");
        return false;
    }

    private function Cadastro($dados, $mensagem){
        $dadosDeCadastro = new Cadastro();
        return $dadosDeCadastro->Cadastrar($dados, $mensagem);
    }

    private function Login($dados, $mensagem){
        
        $login = new Login();
        return $login->Acessando($dados, $mensagem);
    }
}

class UserRepository{
    private function getStoragePath(){
        return __DIR__ . '/data/users.json';
    }

    private function ensureStorage(){
        $dir = dirname($this->getStoragePath());
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        if (!file_exists($this->getStoragePath())){
            file_put_contents($this->getStoragePath(), json_encode([ 'users' => new \stdClass() ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    }

    public function loadUsers(){
        $this->ensureStorage();
        $raw = file_get_contents($this->getStoragePath());
        $data = json_decode($raw, true);
        if (!is_array($data)) { $data = []; }
        if (!isset($data['users']) || !is_array($data['users'])) { $data['users'] = []; }
        return $data['users'];
    }

    public function saveUsers($users){
        $this->ensureStorage();
        $data = [ 'users' => $users ];
        return (bool) file_put_contents($this->getStoragePath(), json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    public function userExists($username){
        $users = $this->loadUsers();
        return array_key_exists($username, $users);
    }

    public function createUser($username, $passwordHash, $empresa = ''){
        $users = $this->loadUsers();
        if (array_key_exists($username, $users)){
            return false;
        }
        $users[$username] = [
            'username' => $username,
            'password_hash' => $passwordHash,
            'empresa' => $empresa,
            'status' => 'Ativo'
        ];
        return $this->saveUsers($users);
    }

    public function findUser($username){
        $users = $this->loadUsers();
        return $users[$username] ?? null;
    }
}

class Cadastro{
    //TO-DO Realizar o cadastro do usúario no banco de dados.
    public function Cadastrar($dados, $mensagem){
        if (!$this->ValidarCadastro($dados, $mensagem)) {
            return false;
        }
        if (!$this->ValidarSenha($dados, $mensagem)) {
            return false;
        }
        if (!$this->ValidarUsuario($dados, $mensagem)) {
            return false;
        }
        $username = (string) $dados['username'];
        $plainPassword = (string) $dados['psswrd'];
        $empresa = isset($dados['empresa']) ? (string) $dados['empresa'] : '';

        $repo = new UserRepository();
        if ($repo->userExists($username)){
            $mensagem->MensagemRetorno("Usuário já cadastrado.\n");
            return false;
        }

        $passwordHash = password_hash($plainPassword, PASSWORD_DEFAULT);
        $created = $repo->createUser($username, $passwordHash, $empresa);
        if (!$created){
            $mensagem->MensagemRetorno("Falha ao salvar cadastro.\n");
            return false;
        }

        $mensagem->MensagemRetorno("Cadastro realizado com sucesso.\n");
        return true;
    }

    //TO-DO Realizar a validação se o cadastro existe.
    private function ValidarCadastro($dados, $mensagem){
        $username = isset($dados['username']) ? (string) $dados['username'] : '';
        $password = isset($dados['psswrd']) ? (string) $dados['psswrd'] : '';

        if (empty($username) || empty($password)){
            $mensagem->MensagemRetorno("Dados necessários faltantes. Informe usuário e senha.\n");
            return false;
        }

        // TODO: Consultar banco para verificar se usuário já existe
        // Placeholder: assumindo que usuário ainda não existe
        $mensagem->MensagemRetorno("Usuário disponível para cadastro.\n");
        return true;
    }

    //TO-DO Realizar a validação se a senha segue o padrão imposto.
    private function ValidarSenha($dados, $mensagem){
        $password = isset($dados['psswrd']) ? (string) $dados['psswrd'] : '';

        $minLengthOk = strlen($password) >= 6;
        $hasNumber = preg_match('/\d/', $password) === 1;

        if (!$minLengthOk || !$hasNumber) {
            $mensagem->MensagemRetorno("Senha inválida. Mínimo de 6 caracteres e pelo menos um número.\n");
            return false;
        }

        return true;
    }
    
    //TO-DO Realizar a validação se segue o Email ou Username padrão imposto
    private function ValidarUsuario($dados, $mensagem){
        $username = isset($dados['username']) ? (string) $dados['username'] : '';

        $isEmail = filter_var($username, FILTER_VALIDATE_EMAIL) !== false;
        $isUsername = preg_match('/^[A-Za-z0-9_.-]{3,}$/', $username) === 1;

        if ($isEmail || $isUsername) {
            return true;
        }

        $mensagem->MensagemRetorno("Usuário " . $username . " inválido. Use e-mail válido ou mínimo de 3 caracteres (letras, números e ._-).\n");
        return false;
    }

}

class Login{
    //TO-DO Realizar o cadastro do usúario no banco de dados.
    public function Acessando($dados, $mensagem){
        if (!$this->ValidarAcesso($dados, $mensagem)) {
            return false;
        }

        // TODO: Aqui continuar o fluxo pós-login
        $mensagem->MensagemRetorno("Login efetuado com sucesso.\n");
        return true;
    }

    //TO-DO Realizar a validação se o usario existe
    private function ValidarAcesso($dados, $mensagem){
        $username = isset($dados['username']) ? (string) $dados['username'] : '';
        $password = isset($dados['psswrd']) ? (string) $dados['psswrd'] : '';

        if (empty($username) || empty($password)){
            $mensagem->MensagemRetorno("Dados necessários faltantes. Informe usuário e senha.\n");
            return false;
        }

        $repo = new UserRepository();
        $user = $repo->findUser($username);
        if (!$user || !isset($user['password_hash'])){
            $mensagem->MensagemRetorno("Usuário não encontrado ou não cadastrado. Favor verificar usuário e senha ou realizar o cadastro.\n");
            return false;
        }

        if (!password_verify($password, (string) $user['password_hash'])){
            $mensagem->MensagemRetorno("Senha inválida.\n");
            return false;
        }

        $mensagem->MensagemRetorno("Carregando...\n");
        return true;

    }

}

class RetornosPersonalizados{
    //TO-DO Realizar retornos personalizados.
    public function MensagemRetorno($mensagem){
        echo $mensagem;
        return;
    }
}


if (PHP_SAPI === 'cli') {
    $run = new Inicializacao();
    $dados = [];
    $dados['username'] = readline("Insira seu nome: \n");
    $dados['psswrd'] = readline("Insira sua senha: \n");
    $dados['empresa'] = readline("Qual empresa você trabalha: \n");
    $tipoAcesso = strtoupper(readline("Escolha uma opção: \n 1 - Cadastro \n 2 - Login \n"));
    $run->Inicio($tipoAcesso, $dados);
}


