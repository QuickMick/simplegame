"use strict";
require('pixi.js');
var Path = require('path');

var Resources = require('./resources.json');
var Config = require('./config.json');


const GameManager = require('./game/manager');

/**
 * will contain update-methods, called in the gamemanager
 * @type {Array}
 */
window.UPDATE = [];



PIXI.Container.prototype.bringToFront = PIXI.Sprite.prototype.bringToFront = function() {
  if (this.parent) {
    var parent = this.parent;
    parent.removeChild(this);
    parent.addChild(this);
  }
};

PIXI.Container.prototype.removeAll = PIXI.Sprite.prototype.removeAll = function() {
  while (this.children[0]) {
    this.removeChild(this.children[0]);
  }
};

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
  window.hideLoadingDialog();
  var screen = document.getElementById("stage");
  // prevent context menu on gameplay
  screen.oncontextmenu = function(e) {
    e.preventDefault();
  };

  //  PIXI.RESOLUTION = 2;
  const app = new PIXI.Application(800, 600, {
    backgroundColor: 0x1099bb,
    antialising: true,
    autoResize: true
  });
  screen.appendChild(app.view);

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
      PIXI.loader.add({
        name: resource_name,
        url: resource_path
      });
    }
  }

  // load game resources and once finished, start the game
  PIXI.loader.once('complete', function() {
    setTimeout(function() {
      window.hideLoadingDialog();
      const gameManager = new GameManager(app);
      gameManager.start();
      app.ticker.add(gameManager.update.bind(gameManager));
      // app.ticker.add(require('./inputhandler').update);
      function resize() {
        const x = screen.getBoundingClientRect();
        app.renderer.resize(x.width, x.height);
        gameManager.emit('resize', {
          width: x.width,
          height: x.height
        });
      }

      resize();
      window.addEventListener("resize", resize);
    }, 100);
  }.bind(this)).load();
};