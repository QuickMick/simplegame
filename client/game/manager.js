/**
 * Created by Mick on 03.12.2017.
 */

'use strict';
const THREE = require("three");
const Events = require('events');
const InputManager = require('./inputmanager');
const Synchronizer = require('./synchronizer');
const MapManager = require('./mapmanager');
const PKG = require('./../../core/com');
const CONFIG = require('./../config.json');

const Effects = require('./effects');

const MS = PKG.PROTOCOL.MODULES.SHOOTER;
const G = PKG.PROTOCOL.GENERAL;

class GameManager extends Events {

  constructor() {
    super();
    //  this.inputManager = new InputManager(this.app);
    // this.inputManager.loadMapping(CONFIG.KEY_MAPPING);

    this.mapManager = new MapManager();
    this.synchronizer = new Synchronizer(MS.TO_CLIENT);
    this.started = false;
  }

  start() {
    window.addEventListener("resize", this.resize.bind(this));

    this.synchronizer.on("on" + MS.TO_CLIENT.CHANGE_MAP,
      (initDataEvt) => this.mapManager.changeMap(initDataEvt.map, this.camera, this.scene));


    this.synchronizer.on("on" + G.TO_CLIENT.UPDATE_STATE, (updates) => {
      console.log("TOOD: incoming update");
    });

    this.synchronizer.start();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.started = true;

  }

  resize() {}

  update(delta) {
    if (!this.started) return;
    // const elapsed = this.app.ticker.elapsedMS;
    // const d = elapsed / 1000;

    //  this.entityManager.update(d);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  startScene(target) {
    const x = target.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(70, x.width / x.height, 0.01, 10);
    this.camera.position.z = 5;


    this.scene = new THREE.Scene();

    Effects.initSky(this.scene);


    this.resize = () => {
      const x = target.getBoundingClientRect();
      this.renderer.setSize(x.width, x.height);
      this.camera.aspect = x.width / x.height;
      this.camera.updateProjectionMatrix();
      this.emit('resize', {
        width: x.width,
        height: x.height
      });
    };

    this.resize();

    target.appendChild(this.renderer.domElement);
  }

}

module.exports = GameManager;