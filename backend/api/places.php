<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../services/PlaceService.php';

$lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
$radius = isset($_GET['radius']) ? intval($_GET['radius']) : 2000;

if ($lat === null || $lng === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Parâmetros lat e lng são obrigatórios']);
    exit;
}

echo json_encode(getPlaces($lat, $lng, $radius));
