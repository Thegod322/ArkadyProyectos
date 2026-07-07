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
$dineroActual = 10000;
$dineroIva = $dineroActual*IVA2." - $iva1p % iva pa pagar cabron";
$dineroIVA2 = $dineroActual*IVA." - $iva2p % iva pa pagar cabron";

if($dineroIva > $dineroIVA2){
   $mensaje = "dineroIva mayor que DineroIva2";
}
else{
    $mensaje = "dineroIva2 es mayor que DineroIva";
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
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
    <?= $boton ?>
    <h1><?php echo $dineroActual?><span> dinero actual </span></h1>
    <h1><?php echo $dineroIva?></h1>
    <h1><?php echo $dineroIVA2?></h1>
    <h1><?php echo $mensaje?></h1>
</body>
</html>