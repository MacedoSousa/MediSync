<?php
// Controller CRUD genérico
class CrudController {
    public function create($entity, $data) {
        // Criar novo registro na entidade/tabela
    }
    public function read($entity, $id) {
        // Buscar registro por ID na entidade/tabela
    }
    public function update($entity, $id, $data) {
        // Atualizar registro na entidade/tabela
    }
    public function delete($entity, $id) {
        // Soft delete (atualizar status) na entidade/tabela
    }
    public function list($entity, $filters = []) {
        // Listar registros da entidade/tabela com filtros
    }
}
