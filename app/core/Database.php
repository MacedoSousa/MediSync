<?php
// Esqueleto da classe Database para MySQL/MariaDB
class Database {
    /** @var \PDO|null */
    private $connection = null;

    /**
     * Cria (lazy) e retorna a conexão PDO. Por ora usamos SQLite em memória apenas para ilustração.
     */
    public function connect(): \PDO {
        if ($this->connection === null) {
            // Em produção trocar DSN/credenciais conforme necessário
            $this->connection = new \PDO('sqlite::memory:');
            $this->connection->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        }
        return $this->connection;
    }

    /**
     * Insere um registro na tabela.
     * @param string $table
     * @param array<string, mixed> $data
     */
    public function insert(string $table, array $data): void {
        $cols = implode(',', array_keys($data));
        $placeholders = implode(',', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO {$table} ({$cols}) VALUES ({$placeholders})";
        $stmt = $this->connect()->prepare($sql);
        $stmt->execute(array_values($data));
    }

    /**
     * Atualiza registros com condição simples.
     * @param string $table
     * @param array<string,mixed> $data
     * @param string $where
     */
    public function update(string $table, array $data, string $where): void {
        $set = implode(',', array_map(fn($k) => "{$k} = ?", array_keys($data)));
        $sql = "UPDATE {$table} SET {$set} WHERE {$where}";
        $stmt = $this->connect()->prepare($sql);
        $stmt->execute(array_values($data));
    }

    /** Marca item como removido logicamente (soft delete) */
    public function softDelete(string $table, int $id): void {
        $sql = "UPDATE {$table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $this->connect()->prepare($sql);
        $stmt->execute([$id]);
    }

    /** Executa consulta genérica e retorna o statement */
    public function query(string $sql, array $params = []): \PDOStatement {
        $stmt = $this->connect()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /** Encerra a conexão */
    public function close(): void {
        $this->connection = null; // PDO fecha ao perder referência
    }
}

