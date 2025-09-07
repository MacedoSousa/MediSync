<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
$radius = isset($_GET['radius']) ? intval($_GET['radius']) : 2000; // metros

if ($lat === null || $lng === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Parâmetros lat e lng são obrigatórios']);
    exit;
}

// Consulta Overpass API (OpenStreetMap)
$query = '[out:json][timeout:25];('.
    'node(around:'.$radius.','.$lat.','.$lng.')[amenity~"hospital|clinic|pharmacy"];' .
    ');out center;';

$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded",
        'content' => $query,
    ],
];
$context = stream_context_create($options);
$response = file_get_contents('https://overpass-api.de/api/interpreter', false, $context);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao consultar Overpass']);
    exit;
}

$data = json_decode($response, true);
$result = [];
if (isset($data['elements'])) {
    foreach ($data['elements'] as $el) {
        $result[] = [
            'id' => $el['id'],
            'name' => $el['tags']['name'] ?? 'Sem nome',
            'type' => $el['tags']['amenity'] ?? '',
            'lat' => $el['lat'],
            'lng' => $el['lon'],
            'phone' => $el['tags']['phone'] ?? '',
            'website' => $el['tags']['website'] ?? '',
        ];
    }
}

echo json_encode($result);
