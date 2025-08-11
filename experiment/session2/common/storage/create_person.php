<?php

function generateRandomString($length = 10) {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

$vp_name = "user";

if (!array_key_exists ( "id" , $_GET )) {
	$vp_name = generateRandomString();
	$max_it = 100;

	while (file_exists("data/" . $vp_name . ".csv")) {
		$vp_name = generateRandomString();
		
		if ($max_it <= 0) {
			echo json_encode(0);
			return;
		}
		$max_it = $max_it - 1;
	}
}
else {
	$vp_name = htmlspecialchars($_GET["id"]);
}

while (file_exists("data/" . $vp_name . ".csv")) {
	$vp_name = "_" . $vp_name;
}
$data = "Timestamp;Data";
$myfile = file_put_contents("data/" . $vp_name . ".csv", $data.PHP_EOL , LOCK_EX | FILE_APPEND);

echo json_encode($vp_name);

