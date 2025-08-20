<?php
require_once __DIR__ . '/../core/RedisClient.php';
// require_once removido: Encryption não é utilizado aqui

class EstabelecimentoController {
    public function buscarProximosPuro($lat, $lng, $radius = 3000) {
        if (!isset($lat) || !isset($lng)) {
            return ['error' => 'Latitude e longitude são obrigatórios.'];
        }
        return $this->buscarEstabelecimentos(floatval($lat), floatval($lng), $radius);
    }

    private function buscarEstabelecimentos($lat, $lng, $radius) {
        $tipos = ['hospital', 'clinica', 'farmacia', 'doctor', 'dentista', 'laboratorio'];
        $estabelecimentos = [];
        foreach ($tipos as $tipo) {
            $estabelecimentos = array_merge($estabelecimentos, $this->buscarPorTipo($lat, $lng, $tipo, $radius));
        }
        return $estabelecimentos;
    }

    private function buscarPorTipo($lat, $lng, $tipo, $radius) {
        $tipoOSM = [
            'hospital'    => 'hospital',
            'clinica'     => 'clinic',
            'farmacia'    => 'pharmacy',
            'doctor'      => 'doctors',
            'dentista'    => 'dentist',
            'laboratorio' => 'laboratory',
        ];
        $q = $tipoOSM[$tipo] ?? $tipo;

        // Redis cache key (rounded coords to 4 decimal places ~11m precision)
        $redis = RedisClient::get();
        $cacheKey = sprintf('est:%s:%0.4f:%0.4f:%d', $tipo, $lat, $lng, $radius);
        if ($redis->exists($cacheKey)) {
            return json_decode($redis->get($cacheKey), true);
        }
        $url = "https://nominatim.openstreetmap.org/search?format=json&extratags=1&amenity=$q&limit=50&bounded=1&viewbox=";
        $dLat = $radius / 111320;
        $dLng = $radius / (40075000 * cos(deg2rad($lat)) / 360);
        $left = $lng - $dLng;
        $right = $lng + $dLng;
        $top = $lat + $dLat;
        $bottom = $lat - $dLat;
        $url .= "$left,$top,$right,$bottom";
        $opts = ["http" => ["header" => "User-Agent: MediSync/1.0"]];
        $context = stream_context_create($opts);
        $json = file_get_contents($url, false, $context);
        $data = json_decode($json, true);
        $result = [];
        foreach ($data as $item) {
            $latItem = floatval($item['lat']);
            $lngItem = floatval($item['lon']);
            $dist    = $this->distance($lat, $lng, $latItem, $lngItem);
            // Filtra estabelecimentos fora do raio especificado
            if ($dist <= $radius) {
                $result[] = [
                    'tipo'        => $tipo,
                    'nome'        => $item['display_name'],
                    'lat'         => $latItem,
                    'lng'         => $lngItem,
                    'distancia_m' => $dist,
                    'phone'       => $item['extratags']['phone'] ?? ($item['extratags']['contact:phone'] ?? null),
                    'whatsapp'    => $item['extratags']['contact:whatsapp'] ?? null,
                ];
            }
        }
        // Ordena pelo mais próximo primeiro
        usort($result, fn($a, $b) => $a['distancia_m'] <=> $b['distancia_m']);

        // Salva cache por 1 hora
        $redis->setex($cacheKey, 3600, json_encode($result));

        return $result;
    }

    /**
     * Calcula a distância em metros entre dois pares (lat,lng) usando a fórmula de Haversine.
     * @return float Distância em metros
     */
    private function distance($lat1, $lng1, $lat2, $lng2) {
        $R = 6371000; // raio médio da Terra em metros
        $phi1 = deg2rad($lat1);
        $phi2 = deg2rad($lat2);
        $deltaPhi = deg2rad($lat2 - $lat1);
        $deltaLambda = deg2rad($lng2 - $lng1);
        $a = sin($deltaPhi / 2) ** 2 + cos($phi1) * cos($phi2) * sin($deltaLambda / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }
}
