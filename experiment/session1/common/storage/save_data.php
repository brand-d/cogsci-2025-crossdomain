<?php

if (!array_key_exists ( "id" , $_GET )) {
	echo json_encode(false);
	return;
}

$vp_name = htmlspecialchars($_GET["id"]);

if (!file_exists("data/" . $vp_name . ".csv")) {
	echo json_encode(false);
	return;
}

date_default_timezone_set('UTC');
$timestamp = date(DATE_ATOM);

$data = file_get_contents('php://input');

if (!$data) {
	echo json_encode(false);
	return;
}

$data = $timestamp . ";" . $data;

$myfile = file_put_contents("data/" . $vp_name . ".csv", $data.PHP_EOL , FILE_APPEND | LOCK_EX);
echo json_encode(true);