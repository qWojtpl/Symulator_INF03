<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="./js/phpSimulation.js"></script>
</head>
<body style="display:flex;">
    <div>
        <textarea name="code" rows=20 cols=50></textarea>
        <button onclick="simulate(document.querySelector('iframe').contentDocument, document.querySelector('textarea').value)">Zapisz</button>
    </div>

    <iframe width=1920 height=1280 style="transform:scale(50%);transform-origin:0 0;"></iframe>

</body>
</html>



