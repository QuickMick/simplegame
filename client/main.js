const Path = require('path');
const THREE = require("three");

const Resources = require('./resources.json');
const Config = require('./config.json');
const GameManager = require('./game/manager');

/**
 * will contain update-methods, called in the gamemanager
 * @type {Array}
 */
window.UPDATE = [];


if (window.requestAnimationFrame) //(func);
  window.requestAnimationFrame = window.requestAnimationFrame;
else if (window.msRequestAnimationFrame)
  window.requestAnimationFrame = window.msRequestAnimationFrame;
else if (window.mozRequestAnimationFrame)
  window.requestAnimationFrame = window.mozRequestAnimationFrame;
else if (window.webkitRequestAnimationFrame)
  window.requestAnimationFrame = window.webkitRequestAnimationFrame;

if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
  Range.prototype.createContextualFragment = function(html) {
    const frag = document.createDocumentFragment(),
      div = document.createElement("div");
    frag.appendChild(div);
    div.outerHTML = html;
    return frag;
  };
}

window.showLoadingDialog = function() {
  document.getElementById("loading-overlay").style.display = ""; //"flex";
};

window.hideLoadingDialog = function() {
  document.getElementById("loading-overlay").style.display = "none";
};


window.onload = function() {
  window.showLoadingDialog();
  const screen = document.getElementById("stage");
  // prevent context menu on gameplay
  screen.oncontextmenu = function(e) {
    e.preventDefault();
  };

  window.resources = new Map();
  const texturePromises = [];
  const loader = new THREE.TextureLoader();
  // preparing loading game resouces
  for (const area_key in Resources) {
    if (!Resources.hasOwnProperty(area_key)) continue;
    const current_area = Resources[area_key];
    if (!current_area.content) continue;

    const folder = current_area.base_folder;
    for (const content_key in current_area.content) {
      if (!current_area.content.hasOwnProperty(content_key)) continue;
      const resource_name = current_area.content[content_key].texture;
      const resource_path = Path.join(Config.PATHS.RESOURCE_BASE, folder, resource_name);

      texturePromises.push(new Promise((resolve, reject) => {
        loader.load(resource_path,
          texture => {
            const result = {
              name: resource_name,
              url: resource_path,
              texture: texture
            };
            window.resources.set(resource_name, result);
            if (texture instanceof THREE.Texture) resolve(result);
          },
          xhr => {
            console.log(resource_name + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
          },
          xhr => {
            reject(new Error(xhr + 'An error occurred loading while loading: ' + resource_path));
          }
        );
      }));
    }
  }

  // load the geometry and the textures
  Promise.all(texturePromises).then(loadedTextures => {
    window.hideLoadingDialog();
    const gameManager = new GameManager();

    gameManager.addScene(require('./game/scenes/gameplay'));

    gameManager.run(screen);

    gameManager.startScene("GAMEPLAY");

    function animate() {
      requestAnimationFrame(animate);
      gameManager.update(1); // TODO: update delta
      for (let i = 0; i < window.UPDATE.length; i++) {
        window.UPDATE[i](delta);
      }
      gameManager.render();
    }
    animate();
    // var geometry = new THREE.SphereGeometry(radius, segments, segments);
    // var material = new THREE.MeshPhongMaterial({
    //   map: textures.map.val,
    //   bumpMap: textures.bumpMap.val,
    //   bumpScale: 0.005,
    //   specularMap: textures.specularMap.val,
    //   specular: new THREE.Color('grey')
    // });

    // var earth = that.earth = new THREE.Mesh(geometry, material);
    // that.add(earth);
  });
};