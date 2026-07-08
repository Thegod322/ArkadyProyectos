<?php 
$var = "text";
$num1 = 5;
$num2 = 10;
$resultado = $num1+$num2;
$nombre = "eblan";
$apellido = "eblanov";
$nombreCompleto = $nombre." - ".$apellido;
$texto = "hola me llamo $nombre $apellido , quiero peresntaros mi pagina web maravillos";
$textoCompuesto = 'me llamo '. $nombre .' y soy muy '.$apellido;
$boton = '<a href="" class ="boton">botooon</a>';
define("IVA",0.21);
const IVA2 = 0.13;
$iva1p = IVA2 * 100;
$iva2p = IVA * 100;
$dineroActual = 0;
if(isset($_GET['dinero']) && is_numeric($_GET['dinero'])){
    $dineroActual = $_GET['dinero'];
    $dineroIva = ($dineroActual*IVA2) . " - $iva1p % iva pa pagar cabron";
    $dineroIVA2 = ($dineroActual*IVA) . " - $iva2p % iva pa pagar cabron";
    
    if($dineroIva > $dineroIVA2){
       $mensaje = "dineroIva mayor que DineroIva2";
    }
    else{
        $mensaje = "dineroIva2 es mayor que DineroIva";
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .ui{
            display: flex;
            height: 300px;
            padding:2rem;
            justify-content: center;
            align-items: center;
            gap:2rem;
        }
        .boton{
            background-color: black;
            color: wheat;
            padding: 10px;
            border: solid rgb(208, 252, 255);
            display : flex;
            justify-self: center;
            font-size:3rem;
            font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        }
        .input{
            height: 5rem;
            font-size: 4rem;
        }
        a{
            text-decoration: none;
        }
    </style>
</head>
<body>
    <h1><?php echo $var?></h1>
    <h1><?php echo $resultado?></h1>
    <h1><?php echo $nombreCompleto?></h1>
    <h1><?php echo $texto?></h1>
    <h1><?php echo $textoCompuesto?></h1>
    <h1>IVA CALCULATOR</h1>
    <form action="" method="GET" class="ui">
        <input type="number" name="dinero" value="<?= $dineroActual ?>" class = "input">
        <button type="submit" class="boton">Calcular IVA</button>
    </form>
    <hr>
    <?php
    if(isset($_GET['dinero']) && $dineroActual > 0){

        echo<<<HTML
            <h1>$dineroActual<span> dinero actual </span></h1>
            <h1>$dineroIva</h1>
            <h1>$dineroIVA2</h1>
            <h1>$mensaje</h1>
        HTML;
    }
    
    
    
    for ($i = 1; $i <= 5; $i++) {
        echo "Esta es la vuelta número: $i <br>";
        }
    echo<<<HTML
        <h1>Aqui vamos a mostrar solo pares</h1>
    HTML;
    for ($i = 0; $i <= 20; $i++) {
        if($i%2==0)
        echo "Esta es la vuelta número: $i <br>";
    }
    echo<<<HTML
        <h1>Aqui vamos a mostrar ciudade del array - Ciudades</h1>
    HTML;
    $ciudades=["Madrid","Barcelona","Malaga","Moscu","Beijin"];
    foreach($ciudades as $ciudad){
        echo $ciudad."<br>";
    }

        $persona=[
        "nombre"=>"Gvozdik",
        "edad"=>"gen-z",
        "ciudad"=>"Donosti"
        ];
        echo $persona["nombre"]."<br>";
    ?>
</body>
</html>