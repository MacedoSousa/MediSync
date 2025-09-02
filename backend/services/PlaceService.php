<?php
function getPlaces(float $lat, float $lng, int $radius = 2000): array
{
    $query = '[out:json][timeout:25];' .
        '(node(around:' . $radius . ',' . $lat . ',' . $lng . ')[amenity~"hospital|clinic|pharmacy|doctors|dentist"];);out center;';

    $opts = [
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $query,
            'timeout' => 20,
        ],
    ];

    $context = stream_context_create($opts);
    $resp = @file_get_contents('https://overpass-api.de/api/interpreter', false, $context);
    if ($resp === false) {
        return [];
    }

    $data = json_decode($resp, true);
    $places = [];
    foreach ($data['elements'] ?? [] as $el) {
        $places[] = [
            'id'      => $el['id'],
            'name'    => $el['tags']['name'] ?? 'Sem nome',
            'type'    => $el['tags']['amenity'] ?? '',
            'lat'     => $el['lat'],
            'lng'     => $el['lon'],
            'phone'   => $el['tags']['phone']   ?? '',
            'website' => $el['tags']['website'] ?? '',
        ];
    }
    return $places;
}
