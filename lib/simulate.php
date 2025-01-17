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
    $sandbox->whitelistFunc("date", "function");
    $sandbox->setOption("allow_functions", "true");
    $sandbox->defineFunc('mysqli_connect', function($s) { echo "brbr ".$s; });

    $code = $_POST["code"];

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
            $newCodeBlock .= "echo \"".addslashes($blocks[$i])."\"; ";
        } else {
            $newCodeBlock .= $blocks[$i];
        }
    } 

    $sandbox->execute($newCodeBlock." ?>");
?>