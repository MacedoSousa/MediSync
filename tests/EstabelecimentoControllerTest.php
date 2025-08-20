<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../app/controllers/EstabelecimentoController.php';

class EstabelecimentoControllerTest extends TestCase
{
    public function testBuscarSemLatLng()
    {
        $ctrl = new EstabelecimentoController();
        $resp = $ctrl->buscarProximosPuro(null, null);
        $this->assertIsArray($resp);
        $this->assertArrayHasKey('error', $resp);
    }

    public function testDistanceZero()
    {
        $ref = new ReflectionClass(EstabelecimentoController::class);
        $method = $ref->getMethod('distance');
        $method->setAccessible(true);
        $ctrl = new EstabelecimentoController();
        $dist = $method->invoke($ctrl, -23.55, -46.63, -23.55, -46.63);
        $this->assertLessThan(0.001, $dist, 'Distance between identical points should be ~0');
    }
}

