<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../app/controllers/EstabelecimentoController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido. Use POST.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
// DEBUG: retornar corpo recebido
if (!$input) {
    echo json_encode(['error' => 'Corpo vazio', 'raw' => file_get_contents('php://input')]);
    exit;
}
$lat = $input['lat'] ?? null;
$lng = $input['lng'] ?? null;
$radius = isset($input['radius']) ? intval($input['radius']) : 3000;

if ($lat === null || $lng === null) {
    echo json_encode(['error' => 'Latitude e longitude são obrigatórios.', 'input' => $input]);
    exit;
}

$controller = new EstabelecimentoController();
$result = $controller->buscarProximosPuro($lat, $lng, $radius);
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
