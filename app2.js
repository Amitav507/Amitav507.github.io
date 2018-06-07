const http = require('http');
var fs = require('fs');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, resp) => {
   if (req.url === "/create") {
        fs.readFile("C:/Users/User/Amitav507.github.io/index.html", function (error, pgResp) {
            if (error) {
                resp.writeHead(404);
                resp.write('Contents you are looking are Not Found');
            } else {
                resp.writeHead(200, { 'Content-Type': 'text/html' });
                resp.write(pgResp);
            }
             
            resp.end();
        });
    } else {
        //4.
        resp.writeHead(200, { 'Content-Type': 'text/html' });
        resp.end('Hello World\n');
    }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});