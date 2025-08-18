<?php
// Exoesqueleto do backend MediSync

// Autoload ou includes dos arquivos de classes
require_once __DIR__ . '/../../app/core/Database.php';
require_once __DIR__ . '/../../app/repositories/UserRepository.php';

// Exemplo de Controller
class UserController {
    public function login($request) {
        // ...
    }
    public function register($request) {
        // ...
    }
    public function getProfile($userId) {
        // ...
    }
}

// Exemplo de Model
class User {
    public $id;
    public $name;
    public $email;
    // ...
    public function __construct($id, $name, $email) {
        // ...
    }
}

// Exemplo de rota simples
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_SERVER['REQUEST_URI'] === '/api/acesso.php') {
    $controller = new UserController();
    $controller->login($_POST);
}
// Outras rotas podem ser adicionadas aqui


