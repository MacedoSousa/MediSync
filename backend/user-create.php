<?php

require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

$inputFileName = 'C:\Users\Soluço\Desktop\Project\MediSync\Dados-login.xlsx';

$spreadsheet = IOFactory::load($inputFileName);
$sheet = $spreadsheet->getActiveSheet();

// Encontrar a primeira linha vazia na coluna A e obter o último ID
$row = 1;
$lastId = 0;
while ($sheet->getCell('A' . $row)->getValue() !== null && $sheet->getCell('A' . $row)->getValue() !== '') {
	$cellValue = $sheet->getCell('A' . $row)->getValue();
	if (is_numeric($cellValue) && $cellValue > $lastId) {
		$lastId = (int)$cellValue;
	}
	$row++;
}

// Novo ID é o último encontrado + 1
$newId = $lastId + 1;

// Escrever os dados na primeira linha vazia
$sheet->setCellValue('A' . $row, $newId);
$sheet->setCellValue('B' . $row, 'Lokan');
$sheet->setCellValue('C' . $row, 'lk@gmail.com');
$sheet->setCellValue('D' . $row, '123@2d');

// Create an Xlsx writer
$writer = new Xlsx($spreadsheet);

// Save the file
$writer->save(__DIR__ . '/../Dados-login.xlsx');

echo "Excel file 'my_excel_file.xlsx' created successfully.";

?>
