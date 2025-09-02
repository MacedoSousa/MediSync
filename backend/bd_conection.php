<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$inputFileName = 'C:\Users\Soluço\Desktop\Project\MediSync\Dados-login.xlsx';

$spreadsheet = IOFactory::load($inputFileName);
$sheet = $spreadsheet->getActiveSheet();
$data = $sheet->toArray();

// Pular a primeira linha (geralmente cabeçalho)
foreach(array_slice($data, 1) as $row) {
    print_r($row);
}
?>