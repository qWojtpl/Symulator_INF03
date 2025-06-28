<?php

if(!isset($_POST["vm-sandbox-code"]) || !isset($_POST["vm-sandbox-exam"])) {
    echo "Error";
    return;
}

define("EXAM_NAME", $_POST["vm-sandbox-exam"]);

require_once("./config.php");
require_once("./functions.php");
require_once("./overrides.php");

function getSandbox($getVariables, $postVariables) {
    $sandbox = new PHPSandbox\PHPSandbox;
    $sandbox->whitelistFunc("date", "function", "var_dump", "define");
    $sandbox->setOption("allow_functions", "true");
    callOverrides($sandbox);
    $sandbox->defineSuperGlobal("_POST", $postVariables);
    $sandbox->defineSuperGlobal("_GET", $getVariables);
    return $sandbox;
}

function simulatePHP($sandbox, $code) {
    $code = str_replace("?>\r\n", "?>", $code);

    $startPositions = strpos_all($code, "<?php");
    $endPositions = strpos_all($code, "?>");

    $blocks = [];
    $phpIndexes = [];

    $from = 0;
    $i = -1;
    $j = 0;
    $phpBlock = false;
    while($from != strlen($code)) {
        $i++;
        if($phpBlock) {
            $from = $startPositions[$j] + 5;
            $to = strlen($code);
            if(isset($endPositions[$j])) {
                $to = $endPositions[$j];
            }
            array_push($blocks, substr($code, $from, $to - $from));
            array_push($phpIndexes, $i);
            if($to == strlen($code)) {
                break;
            }
            $from = $to + 2;
            $j++;
            $phpBlock = false;
            continue;
        }
        $to = strlen($code);
        if(isset($startPositions[$j])) {
            $to = $startPositions[$j];
            $phpBlock = true;
        }
        array_push($blocks, substr($code, $from, $to - $from));
        $from = $to;
    }


    $newCodeBlock = "<?php ";


    for($i = 0; $i < count($blocks); $i++) { 
        if(!in_array($i, $phpIndexes)) {
            $newCodeBlock .= "echo '".str_replace("'", "", $blocks[$i])."'; ";
        } else {
            $newCodeBlock .= $blocks[$i];
        }
        $newCodeBlock .= "\n";
    } 

    $sandbox->execute($newCodeBlock." ?>");
} 

$getVariables = [];
$postVariables = [];

foreach($_POST as $key => $value)
{
    if(str_starts_with($key, "get-")) {
        $getVariables[str_replace("get-", "", $key)] = $value;
    } else if(str_starts_with($key, "post-")) {
        $postVariables[str_replace("post-", "", $key)] = $value;
    }
}

$sandbox = getSandbox($getVariables, $postVariables);
simulatePHP($sandbox, $_POST["vm-sandbox-code"]);

o_mysqli_neutralize();

?>