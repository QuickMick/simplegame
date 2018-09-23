const Scene = require('./scene');
const THREE = require("three");

const MapManager = require('./../mapmanager');

class GamePlay extends Scene {
  constructor() {
    super();
    this.mapManager = new MapManager();
    this.camera = new THREE.PerspectiveCamera(70, x.width / x.height, 0.01, 10);
    this.camera.position.z = 5;
  }


  init() {

  }
}

module.exports = GamePlay;