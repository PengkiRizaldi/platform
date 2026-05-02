<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Tangani preflight request (OPTIONS) untuk CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Deklarasi parameter koneksi
$host = "localhost";
$user = "root";
$pass = ""; // Kosongkan jika XAMPP bawaan
$db   = "db_toko";

// Membuka jembatan koneksi dengan @ untuk menyembunyikan warning PHP jika DB mati
$koneksi = @mysqli_connect($host, $user, $pass, $db);

// Cek jika koneksi gagal
if (!$koneksi) {
    die(json_encode(["status" => "error", "pesan" => "Koneksi Database Gagal!"]));
}
?>