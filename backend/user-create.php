<?php

require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

$inputFileName = 'C:\Users\Soluço\Desktop\Project\MediSync\Dados-login.xlsx';

$spreadsheet = IOFactory::load($inputFileName);
$sheet = $spreadsheet->getActiveSheet();


// Get the active worksheet
$sheet = $spreadsheet->getActiveSheet();

// Set cell values
$sheet->setCellValue('A10', 'Lucy Melomark');
$sheet->setCellValue('B10', 'melo@gmail.com');
$sheet->setCellValue('C10', '123@dxd');

// Create an Xlsx writer
$writer = new Xlsx($spreadsheet);

// Save the file
$writer->save(__DIR__ . '/../Dados-login.xlsx');

echo "Excel file 'my_excel_file.xlsx' created successfully.";

?>
