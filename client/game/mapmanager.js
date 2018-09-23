const THREE = require("three");

class MapManager {
  constructor() {

  }

  /*
  map:
data: []
height: 0
tiles: Array(1)
0: {texture: "missing.png"}
length: 1
__proto__: Array(0)
width: 0
__proto__: Object
  
  */

  changeMap(map, camera, scene) {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const i = (y * map.width) + x;
        const d = map.data[i];
        if (d < 0) continue;

        const t = map.tiles[d];

        const material = new THREE.MeshBasicMaterial({
          map: window.resources.get(t.texture).texture
        });

        const geometry = new THREE.BoxGeometry(t.size, t.size, t.size);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = x * s;
        mesh.position.y = y * s;
        scene.add(mesh);

      }
    }

  }
}

module.exports = MapManager;