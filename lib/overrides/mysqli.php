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
        $this->realConnection = mysqli_connect(MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD);

        $this->select_db($database);

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

    public function select_db($database) {
        mysqli_select_db($this->realConnection, "simulator_schema");
        $statement = mysqli_prepare($this->realConnection, "SELECT required FROM required_names WHERE exam=? LIMIT 1");
        $exam = EXAM_NAME;
        mysqli_stmt_bind_param($statement, "s", $exam);
        mysqli_stmt_execute($statement);

        mysqli_stmt_bind_result($statement, $requiredDb);
        mysqli_stmt_fetch($statement);
        mysqli_stmt_close($statement);

        if($database != $requiredDb) {
            throw new o_mysqli_exception("Nie istnieje baza danych o nazwie ".$database);
        }

        mysqli_select_db($this->realConnection, EXAM_NAME);
    }

    private function setAffectedRows($value) {
        $reflection = new ReflectionProperty(o_mysqli::class, "affected_rows");
        $reflection->setValue($this, $value);
    }

    public function query($query) {
        mysqli_autocommit($this->realConnection, false);
        mysqli_begin_transaction($this->realConnection);

        $querySeparator = "↵";
        $query = str_replace($querySeparator, "", $query);
        $sessionSource = "INF03-QUERIES".EXAM_NAME;

        if(isset($_SESSION[$sessionSource])) {
            $queries = explode($querySeparator, $_SESSION[$sessionSource]);
            for($i = 0; $i < count($queries); $i++) {
                if($queries[$i] == "") {
                    continue;
                }
                mysqli_query($this->realConnection, $queries[$i]);
            }
        }

        $realResult = mysqli_query($this->realConnection, $query);
        $this->setAffectedRows(mysqli_affected_rows($this->realConnection));
        if((str_starts_with(strtoupper($query), "INSERT") || str_starts_with(strtoupper($query), "UPDATE") || str_starts_with(strtoupper($query), "DELETE")) && $realResult) {
            if($this->affected_rows > 0) {
                if(!isset($_SESSION[$sessionSource])) {
                    $_SESSION[$sessionSource] = "";
                }
                $_SESSION[$sessionSource] .= $query.$querySeparator;
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

function o_mysqli_select_db($mysql, $db) {
    $mysql->select_db($db);
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