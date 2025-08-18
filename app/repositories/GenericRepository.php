<?php
// Repositório genérico para CRUD
class GenericRepository {
    public function create($table, $data) {
        // Inserir dados na tabela
    }
    public function read($table, $id) {
        // Buscar registro por ID
    }
    public function update($table, $id, $data) {
        // Atualizar registro
    }
    public function softDelete($table, $id) {
        // Soft delete (atualizar status)
    }
    public function list($table, $filters = []) {
        // Listar registros com filtros
    }
}
