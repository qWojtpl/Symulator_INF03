<?php

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
    private $realConnection;

    public function __construct($hostname = null, $username = null, $password = null, $database = null) {
        if($hostname == "--dummy") {
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
        $this->realConnection = mysqli_connect("localhost", "root", "", "baza");
        array_push($connections, $this);
    }

    public function close() {
        global $connections;
        $newConnections = [];
        for($i = 0; $i < count($connections); $i++) {
            if($connections[$i] == $this) {
                continue;
            } else {
                array_push($connections, $connections[$i]);
            }
        }
        $connections = $newConnections;
        mysqli_close($this->realConnection);
    }

}

function o_mysqli_connect($hostname = null, $username = null, $password = null, $database = null) {
    $mysqli = new o_mysqli($hostname, $username, $password, $database);
    return $mysqli;
}

function o_mysqli_close($mysql) {
    $mysql->close();
}

function o_mysqli_neutralize() {
    global $connections;
    for($i = 0; $i < count($connections); $i++) {
        $connections[$i]->close();
    }
}

?>