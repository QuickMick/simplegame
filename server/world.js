const Planck = require("planck-js");
const Vec2 = require("planck-js/lib/common/Vec2");
const TICKS = require("./../core/ticks.json");

function createEmptyMap(width, height) {
  return {
    width: width,
    height: height,
    data: [], //contains indexes of the tiles array
    tiles: [{
      texture: "missing.png",
      size: 0.2
    }]
  };
}

class World {
  constructor() {
    this.world = null;
    this.map = null;
    this._loadMap();
  }

  start() {
    this.world = Planck.World(Vec2(0, -10));

    this.world.on('begin-contact', () => {});
    this.world.on('end-contact', () => {});
    this.world.on('pre-solve', () => {});
    this.world.on('post-solve', () => {});
    this.world.on('joint-removed', () => {});
    this.world.on('fixture-removed', () => {});
    this.world.on('body-removed', () => {});

    setInterval(() => {
      // in each frame call world.step(timeStep) with fixed timeStep
      world.step(TICKS.SERVER_UPDATE_INTERVAL);
      // iterate over bodies and fixtures
      for (var body = world.getBodyList(); body; body = body.getNext()) {
        for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
          // draw or update fixture
        }
      }
    }, TICKS.SERVER_UPDATE_INTERVAL);
  }

  getMap() {
    return this.map;
  }

  /**
   * loads a map
   *
   * @param {map} map object
   * @memberof World
   */
  _loadMap(map) {
    const width = 10;
    const height = 10;
    this.map = createEmptyMap(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y === 0 || x === 0 || y === (height - 1) || x === (width - 1))
          this.map.data[(y * width) + x] = 0;
        else this.map.data[(y * width) + x] = -1;
      }
    }
  }

  update(delta) {
    // this.world.step(TICKS.SERVER_UPDATE_INTERVAL);
    this.world.step(delta);
  }

  addPlayer(client) {
    const player = this.world.createBody(Vec2(0, 0));
    // planck.Circle();
  }
}

module.exports = World;

/**
 * 
planck.testbed('Tiles', function(testbed) {
  var pl = planck, Vec2 = pl.Vec2;
  var world = pl.World(Vec2(0, -10));

  var e_count = 20;

  var m_fixtureCount = 0;

  var a = 0.5;
  var ground = world.createBody(Vec2(0, -a));

  if (1) {
    var N = 200;
    var M = 10;
    var position = Vec2();
    position.y = 0.0;
    for (var j = 0; j < M; ++j) {
      position.x = -N * a;
      for (var i = 0; i < N; ++i) {
        ground.createFixture(pl.Box(a, a, position, 0.0), 0.0);
        ++m_fixtureCount;
        position.x += 2.0 * a;
      }
      position.y -= 2.0 * a;
    }

  } else {
    var N = 200;
    var M = 10;
    var position = Vec2();
    position.x = -N * a;
    for (var i = 0; i < N; ++i) {
      position.y = 0.0;
      for (var j = 0; j < M; ++j) {
        ground.createFixture(pl.Box(a, a, position, 0.0), 0.0);
        position.y -= 2.0 * a;
      }
      position.x += 2.0 * a;
    }
  }

  var a = 0.5;
  var shape = pl.Box(a, a);

  var x = Vec2(-7.0, 0.75);
  var y = Vec2();
  var deltaX = Vec2(0.5625, 1.25);
  var deltaY = Vec2(1.125, 0.0);

  var bd = {};
  bd.type = 'dynamic';
  for (var i = 0; i < e_count; ++i) {
    y = x;

    for (var j = i; j < e_count; ++j) {
      bd.position = y;

      // bd.allowSleep = !(i == 0 && j == 0)

      var body = world.createBody(bd);
      body.createFixture(shape, 5.0);
      ++m_fixtureCount;
      y.add(deltaY);
    }

    x.add(deltaX);
  }

  var m_createTime = Date.now();

  testbed.step = function() {
    var height = world.getTreeHeight();
    var leafCount = world.getProxyCount();
    var minimumNodeCount = 2 * leafCount - 1;
    var minimumHeight = Math.ceil(Math.log(minimumNodeCount) / Math.log(2.0));

    testbed.status("dynamic tree height", height);
    testbed.status("min", minimumHeight);
    testbed.status("create time", m_createTime + "ms");
    testbed.status("fixture count", m_fixtureCount);

    // var tree = world.m_broadPhase.m_tree;
    // if (world.m_stepCount == 400) {
    // tree.rebuildBottomUp();
    // }
  };

  return world;
});
 * 
 */