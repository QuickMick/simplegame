'use strict';
const debug = require('debug')('wastelandworld:server');
const socketIo = require('socket.io');
const uuid = require("uuid/v4");

const CONF = require('./conf.json');

const generateName = require('./../util/namegenerator');
const COLORS = [];
class Client {
  constructor(socket) {
    this.id = uuid();
    this.socket = socket;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.name = generateName();
  }

  getClientData() {
    return {
      color: this.color,
      name: this.name
    };
  }
}

class Server {
  constructor() {
    this.id = uuid();
    this.io = null;
    this.connected = 0;
    this.clients = new Map();
  }

  run(server) {
    this.io = socketIo(server);
    debug("sockets running");

    this.io.on("connection", this._clientConnected.bind(this));

  }

  _clientConnected(socket) {
    // if there are to many clients connected,
    // refuse the connection and return
    if (this.clients.size() >= CONF.MAX_CLIENTS) {
      socket.disconnect();
      return;
    }
    // creat client and add it to the list
    this.clients.set(socket.id, new Client(socket));
    debug(`client ${socket.id} with ip ${socket.handshake.address} disconnected`);
    socket.on("disconnect", this._clientDisconnect.bind(this, socket));
  }

  _clientDisconnect(socket, reason) {


    debug(`client ${socket.id} disconnected`);
    this.clients.delete(socket.id);
  }


  _broadcast(type, msg) {
    // this.io.sockets.emit(type,msg);
    // this.io.in(this.id).emit(type,msg);
    this.io.emit(type, msg);
  }

  _broadcastExceptSender(senderSocket, type, msg) {
    senderSocket.broadcast.emit(type, msg);
  }

  _sendToClient(clientConnectionSocket, type, msg) {
    clientConnectionSocket.emit(type, msg);
  }

  _sendErrorToClient(clientSocket, reason) {
    this._sendToClient(
      clientSocket,
      Packages.PROTOCOL.GENERAL.TO_CLIENT.ERROR,
      Packages.createEvent(
        this.id, { reason: reason }
      )
    );
  }

  _broadcastErrorToClient(reason) {
    this._broadcast(
      Packages.PROTOCOL.GENERAL.TO_CLIENT.ERROR,
      Packages.createEvent(
        this.id, { reason: reason }
      )
    );
  }
}

module.exports = Server;