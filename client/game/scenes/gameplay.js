const Scene = require('./scene');
const THREE = require("three");

const MapManager = require('./../mapmanager');

const PKG = require('./../../../core/com');
const MS = PKG.PROTOCOL.MODULES.SHOOTER;
const G = PKG.PROTOCOL.GENERAL;

class GamePlay extends Scene {
  constructor() {
    super();
    this.mapManager = new MapManager();
  }

  static getName() {
    return "GAMEPLAY";
  }

  init(renderer, target, synchronizer) {
    const x = target.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(100, x.width / x.height, 0.01, 10);

    this.camera.position.z = 5;
    this.resize(target, renderer);
    synchronizer.on("on" + MS.TO_CLIENT.CHANGE_MAP,
      (initDataEvt) => {
        const meshes = this.mapManager.changeMap(initDataEvt.map);
        for (let mesh of meshes) {
          this.scene.add(mesh);
        }
      });

    synchronizer.on("on" + G.TO_CLIENT.UPDATE_STATE, (updates) => {
      console.log("TOOD: incoming update");
    });
  }


  _buildScene(map) {

  }
}

module.exports = GamePlay;