<?php

header('Content-type: application/json');

date_default_timezone_set("UTC");
$json = '{"datetime": "'.date("Y-m-d\\TH:i:s\\Z", time()).'"}';

if ($_GET['callback'] != '') $json = $_GET['callback']."( $json )";
print $json
?>