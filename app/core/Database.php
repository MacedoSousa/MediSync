<?php
// Esqueleto da classe Database para MySQL/MariaDB
class Database {
    private $connection;

    public function connect() {
        // Conectar ao banco de dados MySQL/MariaDB
    }

    public function insert($table, $data) {
        // Inserir dados na tabela
    }

    public function update($table, $data, $where) {
        // Atualizar dados na tabela
    }

    public function softDelete($table, $id) {
        // Soft delete: atualizar status para inativo
    }

    public function query($sql, $params = []) {
        // Executar query genérica
    }

    public function close() {
        // Fechar conexão
    }
}

