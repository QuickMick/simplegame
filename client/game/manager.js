/**
 * Created by Mick on 03.12.2017.
 */

'use strict';
const THREE = require("three");
const Events = require('events');
const InputManager = require('./inputmanager');
const Synchronizer = require('./synchronizer');
const MapManager = require('./mapmanager');
const CONFIG = require('./../config.json');
const Effects = require('./effects');

const PKG = require('./../../core/com');
const MS = PKG.PROTOCOL.MODULES.SHOOTER;
const G = PKG.PROTOCOL.GENERAL;

class GameManager extends Events {

  constructor() {
    super();
    //  this.inputManager = new InputManager(this.app);
    // this.inputManager.loadMapping(CONFIG.KEY_MAPPING);

    this.scenes = {};

    this.mapManager = new MapManager();
    this.synchronizer = new Synchronizer(MS.TO_CLIENT);
    this.started = false;
  }

  run(target) {
    this.target = target;
    window.addEventListener("resize", this.resize.bind(this));
    this.synchronizer.start();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.started = true;

    target.appendChild(this.renderer.domElement);
  }

  _initListeners() {
    this.synchronizer.on("on" + G.TO_CLIENT.UPDATE_STATE, (updates) => {
      console.log("TOOD: incoming update");
    });
  }

  addScene(scene) {
    this.scenes[scene.getName()] = new scene();
  }

  startScene(name) {
    if (this.currentScene) {
      this.currentScene.pause();
      this.currentScene.stop();
    }
    this.synchronizer.removeAllListeners();
    this._initListeners();

    this.currentScene = this.scenes[name];
    this.currentScene.init(this.renderer, this.target, this.synchronizer);

    this.currentScene.continue();
    this.resize();
  }

  resize() {
    if (!this.currentScene) return;
    this.currentScene.resize(this.target, this.renderer);
  }

  update(delta) {
    if (!this.started) return;
    if (!this.currentScene) return;
    // const elapsed = this.app.ticker.elapsedMS;
    // const d = elapsed / 1000;

    this.currentScene.update(delta);
  }

  render() {
    if (!this.currentScene) return;
    this.currentScene.render(this.renderer);
  }
}

module.exports = GameManager;