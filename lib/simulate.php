<?php 

    function strpos_all($haystack, $needle) {
        $offset = 0;
        $allpos = array();
        while (($pos = strpos($haystack, $needle, $offset)) !== FALSE) {
            $offset   = $pos + 1;
            $allpos[] = $pos;
        }
        return $allpos;
    }

    require_once("../vendor/autoload.php");

    $sandbox = new PHPSandbox\PHPSandbox;
    $sandbox->whitelistFunc("date", "function", "var_dump");
    $sandbox->setOption("allow_functions", "true");
    $sandbox->defineFunc('mysqli_connect', function($s) { echo "brbr ".$s; });

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

    $sandbox->defineSuperGlobal("_POST", $postVariables);
    $sandbox->defineSuperGlobal("_GET", $getVariables);

    $code = $_POST["vm-sandbox-code"];

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

?>