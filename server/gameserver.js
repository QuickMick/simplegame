'use strict';
const debug = require('debug')('wastelandworld:server');
const socketIo = require('socket.io');

class Server {
    constructor() {
        this.io = null;
    }

    run(server) {
        this.io = socketIo(server);
        debug("sockets running");
    }
}

module.exports = Server;