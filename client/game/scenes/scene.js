const THREE = require("three");

class Scene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
  }

  /**
   *
   * @static
   * @memberof Scene
   * @returns [string] the name
   */
  static getName() {
    throw new Error("Override with name");
  }

  resize(target, renderer) {
    const x = target.getBoundingClientRect();
    renderer.setSize(x.width, x.height);
    if (!this.camera) return;
    this.camera.aspect = x.width / x.height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * called when the scene is started
   *
   * @param {*} synchronizer
   * @memberof Scene
   */
  init(renderer, target, synchronizer) {

  }

  /**
   *called on pause
   *
   * @memberof Scene
   */
  pause() {

  }

  /**
   *called after start or after pause
   *
   * @memberof Scene
   */
  continue () {

  }

  /**
   * cleanup
   *
   * @memberof Scene
   */
  stop() {

  }



  update(delta) {

  }

  render(renderer) {
    renderer.render(this.scene, this.camera);
  }
}

module.exports = Scene;