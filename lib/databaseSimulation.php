<?php

include("./overrides/mysqli.php");

if(isset($_GET["structure"])) {

    header("Content-Type: application/json; charset=utf-8");

    $conn = mysqli_connect("localhost", "root", "");

    $query = mysqli_query($conn, "SELECT c.TABLE_NAME, c.COLUMN_NAME, c.COLUMN_TYPE, c.IS_NULLABLE, c.COLUMN_KEY, c.EXTRA, COALESCE(CONCAT(k.REFERENCED_TABLE_NAME, ' ', k.REFERENCED_COLUMN_NAME), 'NULL') AS ref FROM INFORMATION_SCHEMA.COLUMNS c LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k ON c.TABLE_SCHEMA = k.TABLE_SCHEMA AND c.TABLE_NAME = k.TABLE_NAME AND c.COLUMN_NAME = k.COLUMN_NAME AND k.REFERENCED_TABLE_NAME IS NOT NULL WHERE c.TABLE_SCHEMA = 'inf_03_2024_06_08' ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION");

    $tables = [];

    while($row = mysqli_fetch_assoc($query)) {
        $table = $row["TABLE_NAME"];
        if(!isset($tables[$table])) {
            $tables[$table] = [];
        }
        $column = [$row["COLUMN_NAME"], $row["COLUMN_TYPE"], $row["IS_NULLABLE"], $row["COLUMN_KEY"], $row["EXTRA"], $row["ref"]];
        array_push($tables[$table], $column);
    }

    echo json_encode($tables);

    mysqli_close($conn);

    return;

}


?>