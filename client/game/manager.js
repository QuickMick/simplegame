/**
 * Created by Mick on 03.12.2017.
 */

'use strict';
const THREE = require("three");
const Events = require('events');
const InputManager = require('./inputmanager');
const Synchronizer = require('./synchronizer');
const PKG = require('./../../core/com');
const CONFIG = require('./../config.json');

class GameManager extends Events {

  constructor() {
    super();
    //  this.inputManager = new InputManager(this.app);
    // this.inputManager.loadMapping(CONFIG.KEY_MAPPING);

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
    // const elapsed = this.app.ticker.elapsedMS;
    // const d = elapsed / 1000;

    //  this.entityManager.update(d);
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  startScene(target) {
    const x = target.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(70, x.width / x.height, 0.01, 10);
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    const s = 0.2;
    this.geometry = new THREE.BoxGeometry(s, s, s);
    this.material = new THREE.MeshBasicMaterial({
      map: window.resources.get("missing.png").texture
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    const resize = () => {
      const x = target.getBoundingClientRect();
      this.renderer.setSize(x.width, x.height);
      this.camera.aspect = x.width / x.height;
      this.camera.updateProjectionMatrix();
      this.emit('resize', {
        width: x.width,
        height: x.height
      });
    };
    window.addEventListener("resize", resize);
    resize();

    target.appendChild(this.renderer.domElement);
  }

}

module.exports = GameManager;