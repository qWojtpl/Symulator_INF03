<?php

session_start();
define("MAX_CONNECTIONS", 1);

$connections = [];

class o_mysqli_exception extends Exception {

    public function __construct($message) {
        parent::__construct($message, 0, null);
    }

    public function __toString() {
        return __CLASS__.": [{$this->code}]: {$this->message}\n";
    }

}

class o_mysqli {

    private $hostname;
    private $username;
    private $password;
    private $database;

    public int $affected_rows;

    private $realConnection;

    public function __construct($hostname = null, $username = null, $password = null, $database = null) {
        if($hostname === "--dummy") {
            return;
        }
        global $connections;
        if(count($connections) >= MAX_CONNECTIONS) {
            throw new o_mysqli_exception("Możesz stworzyć maksymalnie (".MAX_CONNECTIONS.") połączeń z bazą danych.");
        }
        $this->hostname = $hostname;
        $this->username = $username;
        $this->password = $password;
        $this->database = $database;
        $this->setAffectedRows(0);
        $this->realConnection = mysqli_connect("localhost", "root", "", "biblioteka2");
        array_push($connections, $this);
    }

    public function close() {
        global $connections;
        $newConnections = [];
        for($i = 0; $i < count($connections); $i++) {
            if($connections[$i] == $this) {
                continue;
            } else {
                array_push($newConnections, $connections[$i]);
            }
        }
        $connections = $newConnections;
        mysqli_close($this->realConnection);
    }

    private function setAffectedRows($value) {
        $reflection = new ReflectionProperty(o_mysqli::class, "affected_rows");
        $reflection->setValue($this, $value);
    }

    public function query($query) {
        mysqli_autocommit($this->realConnection, false);
        mysqli_begin_transaction($this->realConnection);

        if(isset($_SESSION["INF-03-QUERIES"])) {
            $queries = explode(";", $_SESSION["INF-03-QUERIES"]);
            for($i = 0; $i < count($queries); $i++) {
                if($queries[$i] == "") {
                    continue;
                }
                mysqli_query($this->realConnection, $queries[$i]);
            }
        }

        $realResult = mysqli_query($this->realConnection, $query);
        $this->setAffectedRows(mysqli_affected_rows($this->realConnection));
        if(str_starts_with(strtoupper($query), "INSERT") || str_starts_with(strtoupper($query), "UPDATE") || str_starts_with(strtoupper($query), "DELETE")) {
            if($this->affected_rows > 0) {
                if(!isset($_SESSION["INF-03-QUERIES"])) {
                    $_SESSION["INF-03-QUERIES"] = "";
                }
                $_SESSION["INF-03-QUERIES"] .= $query.";";
            }
        }

        mysqli_rollback($this->realConnection);
        return new o_mysqli_result($realResult);
    }

}

class o_mysqli_result {

    public function __construct($result) {
        if($result === "--dummy") {
            return;
        }
    }

}

function o_mysqli_affected_rows($mysql) {
    if(isset($mysql->affected_rows)) {
        return $mysql->affected_rows;
    }
    return 0;
}

function o_mysqli_connect($hostname = null, $username = null, $password = null, $database = null) {
    $mysqli = new o_mysqli($hostname, $username, $password, $database);
    return $mysqli;
}

function o_mysqli_close($mysql) {
    $mysql->close();
}

function o_mysqli_query($mysql, $query) {
    $mysql->query($query);
}

// Neutralize (close) all remaining connections
function o_mysqli_neutralize() {
    global $connections;
    if(count($connections) > 0) {
        throw new o_mysqli_exception("Zostawiłes otwartych ".count($connections)." połączeń");
    }
    for($i = 0; $i < count($connections); $i++) {
        $connections[$i]->close();
    }
}

?>