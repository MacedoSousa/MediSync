<?php

use Predis\Client;

class RedisClient {
    private static ?Client $instance = null;

    public static function get(): Client {
        if (self::$instance === null) {
            $host = getenv('REDIS_HOST') ?: '127.0.0.1';
            self::$instance = new Client(['host' => $host]);
        }
        return self::$instance;
    }
}
