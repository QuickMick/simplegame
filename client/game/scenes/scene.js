const THREE = require("three");

class Scene {
  constructor(target, renderer) {
    this.target = target;
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = null;
  }

  resize() {
    const x = this.target.getBoundingClientRect();
    this.renderer.setSize(x.width, x.height);
    if (!this.camera) return;
    this.camera.aspect = x.width / x.height;
    this.camera.updateProjectionMatrix();
  }

  init() {

  }

  update() {

  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  pause() {

  }

  continue () {

  }

  clean() {

  }
}

module.exports = Scene;