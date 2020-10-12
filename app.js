const http = require('http');
var express = require('express');
var app = express();

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200 ;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hola Mundo!\n');
});

server.listen(port, hostname, () =>{
    console.log(`Sevidor esta corriendo sobre http://${hostname}:${port}`);
});

app.get('/', function(req,res){
    res.send('Hola Mundo!');
});

app.listen(3000, function(){
    console.log(`Aplicacion ejemplo, escuchando en el puerto: ${port}!`);
});

