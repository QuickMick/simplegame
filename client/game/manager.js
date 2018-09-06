/**
 * Created by Mick on 03.12.2017.
 */

'use strict';

const Events = require('events');
const InputManager = require('./inputmanager');
const Synchronizer = require('./synchronizer');
const PKG = require('./../../core/com');
const CONFIG = require('./../config.json');

class GameManager extends Events {

  constructor(app) {
    super();
    this.app = app;

    this.on('resize', (d) => {});

    this.inputManager = new InputManager(this.app);
    this.inputManager.loadMapping(CONFIG.KEY_MAPPING);

    this.synchronizer = new Synchronizer(PKG.PROTOCOL.MODULES.MINIGOLF.TO_CLIENT);

  }

  start() {
    /*
        //TODO von evts json
        //   this.synchronizer.on("on"+COM.PROTOCOL.MODULES.MINIGOLF.TO_CLIENT.MAP,(map) => this.mapManager.onMapReceived(map));
        this.synchronizer.on("onInitGame", (initDataEvt) => this.mapManager.initDataHandler(initDataEvt));
        this.synchronizer.on("onInitGame", (initDataEvt) => this.entityManager.initDataHandler(initDataEvt));
        this.synchronizer.on("onServerUpdate", (updates) => this.entityManager.updateState(updates));
        //this.synchronizer.on("on"+COM.PROTOCOL.MODULES.MINIGOLF.TO_CLIENT.ENTITY_ADDED,(entityEvt)=>this.entityManager.entityAddedHandler(entityEvt)); //TODO: add entitymanager

        this.synchronizer.on("on" + PKG.PROTOCOL.MODULES.MINIGOLF.TO_CLIENT.PLAYER_SCORED, (evt) => this.entityManager.onPlayerScored(evt));

        this.synchronizer.on("onClientConnected", (initDataEvt) => this.entityManager.initDataHandler(initDataEvt));

        this.inputManager.on("mousemove", (e) => this.playerActionManager.onMouseMove(e));
    */
    this.synchronizer.start();

  }

  update(delta) {
    const elapsed = this.app.ticker.elapsedMS;
    const d = elapsed / 1000;

    //  this.entityManager.update(d);
    for (let i = 0; i < window.UPDATE.length; i++) {
      window.UPDATE[i](d);
    }
  }

}

module.exports = GameManager;