// tools.js — one job: the thief's tools. Each costs something, each buys a way out.
// Coin: thrown to a clicked spot, pulls the nearest guard to investigate it.
// Lockpick: hold E at a locked door, 2.5 seconds of exposure, door swings open.
// EMP: Q fries every camera for 6 seconds. Coins and EMP charges are limited.
function makeTools() {
  return {
    coins: HEIST_CONFIG.coinsStart,
    emp: HEIST_CONFIG.empStart,
    lockpickProgress: 0,
    lockpicking: false,
    distraction: null
  };
}

function throwDistraction(tools, x, y, guards, audio) {
  if (tools.coins <= 0) { audio.playDeny(); return false; }
  tools.coins--;
  tools.distraction = { x: x, y: y, left: HEIST_CONFIG.distractionSeconds };
  var nearest = null, best = 1e9;
  for (var i = 0; i < guards.length; i++) {
    var g = guards[i];
    var dx = g.x - x, dy = g.y - y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < best) { best = d; nearest = g; }
  }
  if (nearest && best < 420) {
    nearest.alerted = true;
    nearest.alertTarget = { x: x, y: y };
    nearest.investigateLeft = HEIST_CONFIG.distractionSeconds;
    nearest.suspicion = Math.max(nearest.suspicion, 40);
  }
  audio.playCoin();
  return true;
}

function fireEMP(tools, cameras, audio) {
  if (tools.emp <= 0) { audio.playDeny(); return false; }
  tools.emp--;
  for (var i = 0; i < cameras.length; i++) {
    cameras[i].disabledLeft = HEIST_CONFIG.empSeconds;
  }
  audio.playEMP();
  return true;
}

function updateTools(tools, dt, player, door, audio) {
  if (tools.distraction) {
    tools.distraction.left -= dt;
    if (tools.distraction.left <= 0) tools.distraction = null;
  }
  tools.lockpicking = false;
  if (!door || door.open) { tools.lockpickProgress = 0; return; }
  var dx = player.x - (door.x + door.w / 2);
  var dy = player.y - (door.y + door.h / 2);
  var near = Math.sqrt(dx * dx + dy * dy) < 70;
  if (near && player.pickHeld) {
    tools.lockpicking = true;
    tools.lockpickProgress += dt / HEIST_CONFIG.lockpickSeconds;
    if (tools.lockpickProgress >= 1) {
      door.open = true;
      tools.lockpickProgress = 0;
      audio.playUnlock();
    }
  } else {
    tools.lockpickProgress = Math.max(0, tools.lockpickProgress - dt * 0.5);
  }
}
