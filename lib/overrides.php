<?php

include("./overrides/mysqli.php");

function callOverrides($sandbox) {
    // mysqli
    $dummy = new o_mysqli("--dummy");
    $sandbox->defineClass("mysqli", get_class($dummy));
    $dummy = new o_mysqli_result("--dummy");
    $sandbox->defineClass("mysqli_result", get_class($dummy));
    $sandbox->defineFunc("mysqli_affected_rows", function($a) {
        return o_mysqli_affected_rows($a);
    });
    $sandbox->defineFunc("mysqli_connect", function(...$values) { 
        return o_mysqli_connect(...$values);
    });
    $sandbox->defineFunc("mysqli_close", function($a) { 
        return o_mysqli_close($a);
    });
    $sandbox->defineFunc("mysqli_query", function($a, $b) {
        return o_mysqli_query($a, $b);
    });
    $sandbox->defineFunc("mysqli_select_db", function($a, $b) {
        return o_mysqli_select_db($a, $b);
    });
}

?>