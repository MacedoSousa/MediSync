<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../../app/acesso.php';

function respond($ok, $message = '', $data = []){
    echo json_encode([
        'success' => (bool) $ok,
        'message' => (string) $message,
        'data'    => $data,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload)) {
    respond(false, 'Payload inválido.');
}

$action = isset($payload['action']) ? strtolower((string) $payload['action']) : '';
$username = isset($payload['username']) ? (string) $payload['username'] : '';
$password = isset($payload['password']) ? (string) $payload['password'] : '';
$empresa  = isset($payload['empresa']) ? (string) $payload['empresa'] : '';

if ($action !== 'login' && $action !== 'register'){
    respond(false, 'Ação inválida.');
}

$dados = [
    'username' => $username,
    'psswrd'   => $password,
    'empresa'  => $empresa,
];

$acesso = new Inicializacao();

ob_start();
$ok = $acesso->Inicio($action === 'register' ? 'CADASTRAR' : 'LOGIN', $dados);
$out = trim(ob_get_clean());

respond((bool) $ok, $out);



