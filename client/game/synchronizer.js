/**
 * Created by Mick on 03.12.2017.
 */

'use strict';

const Events = require('events');

const Ticks = require('./../../core/ticks.json');
const PKG = require("./../../core/com");
const UpdateQueue = require('./../../core/updatequeue');

const EVT_ON_CLIENT_VALUE_REJECTED = "onClientValueRejected";
const EVT_ON_CLIENT_VALUE_UPDATE = "onClientValueUpdate";

const EVT_ON_CLIENT_ACCEPTED = "onClientAccepted";
const EVT_ON_INIT_GAME = "onInitGame";

const EVT_ON_CLIENT_CONNECTED = "onClientConnected";
const EVT_ON_CLIENT_DISCONNECTED = "onClientDisconnected";

const EVT_ON_SERVER_ERROR = "onServerError";

const EVT_ON_SERVER_UPDATE = "onServerUpdate";
const EVT_ON_SERVER_UPDATE_SEPERATOR = "_";

/**
 * Receives all data from the server and changed data from the client and distributes it.
 */
class Synchronizer extends Events {
  constructor(supportedMessages) {
    super();
    this.socket = null;

    /**
     *  contains all necessary client infos
     * @type {object} like{
     * socket,
        id,
        color,
        name
        }
     */
    this.CLIENT_INFO = {};

    /**
     * used to detect updates which were done by the client
     * @type {EntityUpdateQueue}
     */
    this.updateQueue = new UpdateQueue();

    /**
     * socket to connect to the server
     * @type {null}
     */
    this.socket = null;

    /**
     * contains the timestamp of the last received gameState update
     * @type {number}
     */
    this.lastGameStateUpdateEventTimeStamp = 0;

    /**
     * contains the last time when the gameState updates was processed
     * @type {number}
     */
    this.lastGameStateUpdateTimeStamp = 0;

    /**
     * once the client is connected,
     * he receives the ID of the server
     * @type {string}
     */
    this.connectedServerID = "";

    /**
     * contains all supported statUpdate
     * @type {Set<any>}
     * @private
     */
    this._suppotedMessages = new Set();

    this.addSupportedMessages(supportedMessages);
  }

  /**
   * pass "TO_CLIENT" object of one section of the PROTOCOL from com.js
   * @param msgObject TO_CLIENT{msgName:"msg"}
   */
  addSupportedMessages(msgObject) {
    let cur = [].concat(msgObject);
    for (let curObj of cur) {
      for (let k in curObj) {
        this._suppotedMessages.add(curObj[k]);
      }
    }
  }

  removeSupportedMessages(msgObject) {
    let cur = [].concat(msgObject);
    for (let curObj of cur) {
      for (let k in curObj) {
        this._suppotedMessages.delete(curObj[k]);
      }
    }
  }

  start() {
    if (this.socket) {
      console.warn("synchronizer already initialized!");
      return;
    }

    this.socket = require('socket.io-client').connect();
    this._initHandlers();
  }

  /**
   * sends game updates from client to server, if changes are detected,
   * is started as soon as client_info is received
   * @private
   */
  _startUpdating() {
    //this interval sends the entityupdates.
    this.updateQueue.flush();
    setInterval(function() {
      if (!this.updateQueue.updateRequired) return;

      this.sendPackage(PKG.PROTOCOL.GENERAL.TO_SERVER.SEND_STATE, PKG.createEvent(
        this.CLIENT_INFO.id,
        this.updateQueue.popUpdatedData(),
        this.CLIENT_INFO.token
      ));
    }.bind(this), Ticks.CLIENT_UPDATE_INTERVAL);
  }

  /**
   * init all socket handlers,
   * if data was sent by the server, this method (to be more exact, the handlers initialized in this method),
   * receives and processes/distributes it.
   * @private
   */
  _initHandlers() {
    // get clientdata of this client
    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.RESPONSE_CLIENT_ACCEPTED, this._onClientAccepted.bind(this));

    // receive data about the dame (after initialisation, or gamechange
    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.INIT_DATA, this._onInitGame.bind(this));

    // receive game updates
    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.UPDATE_STATE, this._onStateUpdate.bind(this));

    // another player connected
    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.CLIENT_CONNECTED, this._onClientConnected.bind(this));

    // an client disconnects
    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.CLIENT_DISCONNECTED, this._onClientDisconnected.bind(this));

    // a value of a client/player has changed
    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.CLIENT_VALUE_UPDATE, this._onClientValueUpdate.bind(this));

    // if value reject from serveris received
    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.CLIENT_VALUE_UPDATE_REJECTED, this._onClientValueUpdateRejected.bind(this));

    this.socket.on('disconnect', this._onDisconnect.bind(this));

    this.socket.on(PKG.PROTOCOL.GENERAL.TO_CLIENT.ERROR, this._onServerError.bind(this));

    // apply listeners for all supported messages
    for (let msg of this._suppotedMessages) {
      this.socket.on(msg, (evt) => {
        this.emit("on" + msg, evt.payload);
      });
    }
  }

  _remmoveHandlers() {
    this.socket.removeAllListeners();
  }

  _onClientAccepted(evt) {
    if (this.connectedServerID) return; // another received package could be from another game, to which the client is connected

    this.connectedServerID = evt.payload.serverID;
    this.CLIENT_INFO = evt.payload.clientInfo;
    console.log("Clientdata received");

    this._startUpdating();
    this.emit(EVT_ON_CLIENT_ACCEPTED, evt.payload.clientInfo);

    window.hideLoadingDialog();
  }

  _onInitGame(evt) {
    if (!this._vertifyServer(evt.senderID)) {
      console.log("message is not from server");
      return;
    }
    this.lastGameStateUpdateEventTimeStamp = this.lastGameStateUpdateTimeStamp = new Date().getTime();
    this.emit(EVT_ON_INIT_GAME, evt.payload);
  }

  _onStateUpdate(evt) {
    if (!this._vertifyServer(evt.senderID)) {
      console.log("message is not from server");
      return;
    }
    if (evt.timeStamp < this.lastGameStateUpdateEventTimeStamp) return; // if update is old, do not apply it
    let currentTime = new Date().getTime();
    this.processServerUpdates(evt.payload, currentTime - this.lastGameStateUpdateTimeStamp);
    this.lastGameStateUpdateEventTimeStamp = evt.timeStamp;
    this.lastGameStateUpdateTimeStamp = currentTime;
  }

  _onClientConnected(evt) {
    if (!this._vertifyServer(evt.senderID)) {
      console.log("message is not from server");
      return;
    }
    this.emit(EVT_ON_CLIENT_CONNECTED, evt.payload);
  }

  _onClientDisconnected(evt) {
    if (!this._vertifyServer(evt.senderID)) {
      console.log("message is not from server");
      return;
    }
    this.emit(EVT_ON_CLIENT_DISCONNECTED, evt.payload);
  }

  _onClientValueUpdate(evt) {
    if (!this._vertifyServer(evt.senderID)) {
      console.log("message is not from server");
      return;
    }
    this.emit(EVT_ON_CLIENT_VALUE_UPDATE, evt.payload);
  }

  _onClientValueUpdateRejected(evt) {
    if (!this._vertifyServer(evt.senderID)) {
      console.log("message is not from server");
      return;
    }
    this._handleValueRejections(evt.payload);
  }

  _onDisconnect(evt) {
    console.log("DISCONNECT", evt);
    // disconnect kann nur ein error sein
    this._remmoveHandlers();
  }

  _onServerError(evt) {
    alert(evt.payload.reason);
    if (!this._vertifyServer(evt.senderID)) {
      console.log("message is not from server");
      return;
    }

    /*  if(evt.data.reason == PKG.PROTOCOL.GAME_SERVER_ERRORS.NO_FREE_SLOT_AVAILABLE){
          // TODO: redirect to lobby
      }
      if(evt.data.reason == PKG.PROTOCOL.GAME_SERVER_ERRORS.GAME_NOT_FOUND){
          // TODO: redirect to lobby
      }*/

    this.emit(EVT_ON_SERVER_ERROR, evt.payload);

    //TODO: redirect to lobby
    this._remmoveHandlers();
  }

  /**
   * handles value rejectsions from the server
   * @param evt
   * @private
   */
  _handleValueRejections(evt) {
    for (let i = 0; i < evt.violations.length; i++) {
      let reason = evt.violations[i];
      this.emit(EVT_ON_CLIENT_VALUE_REJECTED, reason);
    }
  }

  /**
   * checks if id is the current server
   * @param id
   * @returns {*|boolean}
   * @private
   */
  _vertifyServer(id) {
    return id && id === this.connectedServerID;
  }

  sendPackage(type, msg) {
    this.socket.emit(type, msg);
  }

  /**
   * sends a message to the server which means, that one value of this client has changed
   * key e.g. "color"
   * value e.g. 0xFFFFFF
   * @param {[{key,value}]}
   */
  sendClientUpdate(data) {
    this.sendPackage(PKG.PROTOCOL.GENERAL.TO_SERVER.CLIENT_VALUE_UPDATE,
      PKG.createEvent(
        this.CLIENT_INFO.id,
        data,
        this.CLIENT_INFO.token
      )
    );
  }

  sendStateUpdate(type, data) {
    this.updateQueue.postUpdate(type,
      this.CLIENT_INFO.id,
      data
    );
  }


  /**
   * processes the batched updates, received from the server
   * @param updateData
   * @param timeSinceLastUpdate the time since the last update was received from the server
   */
  processServerUpdates(updateData, timeSinceLastUpdate) {
    this.emit(EVT_ON_SERVER_UPDATE, {
      updates: updateData,
      timeSinceLastUpdate: timeSinceLastUpdate
    });

    for (let type in updateData) {
      if (!updateData.hasOwnProperty(type)) continue;

      let updates = updateData[type];

      this.emit(EVT_ON_SERVER_UPDATE + EVT_ON_SERVER_UPDATE_SEPERATOR + type, {
        type: type,
        updates: updates,
        timeSinceLastUpdate: timeSinceLastUpdate
      });
    }
  }
}

Synchronizer.ON_MAPCHANGE = "onMapchange";

module.exports = Synchronizer;