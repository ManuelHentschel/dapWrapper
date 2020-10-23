
import { ProtocolServer } from "./protocol";
import * as net from 'net';


export function start(){

    const port = 12321;
    const host = 'localhost';

    const protocolServer = new ProtocolServer();

    const dapServer = net.createServer((socket) => {
        protocolServer.start(socket, socket);
    });
    dapServer.listen(port, host);

    console.log(`Listening on ${host}:${port}`);
}


start();

