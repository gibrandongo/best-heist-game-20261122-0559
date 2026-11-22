// main.js — one job: run the heist. State machine, loop, collisions, win/lose,
// the screenshot poses (?shot=1..4) and the test handle window.__heist.
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var input = makeInput(canvas);
var audio = makeAudio();
var LEVELS = defineLevels();

var state = null;
var lastTime = 0;
var sirenCooldown = 0;

function buildSolids(level, door) {
  var solids = level.walls.slice();
  for (var i = 0; i < level.cover.length; i++) solids.push(level.cover[i]);
  if (door && !door.open) solids.push(door);
  return solids;
}

function sightSolids(level, door) {
  var solids = level.walls.slice();
  if (door && !door.open) solids.push(door);
  return solids;
}

function startLevel(index) {
  var level = LEVELS[index];
  var door = level.lockedDoor ?
    { x: level.lockedDoor.x, y: level.lockedDoor.y, w: level.lockedDoor.w, h: level.lockedDoor.h, open: false } : null;
  state = {
    phase: 'playing',
    levelIndex: index,
    level: level,
    player: { x: level.playerStart.x, y: level.playerStart.y, sneaking: false, moving: false, pickHeld: false },
    guards: level.guards.map(makeGuard),
    cameras: level.cameras.map(makeCamera),
    loot: level.loot.map(makeLoot),
    alarm: makeAlarm(),
    tools: makeTools(),
    door: door,
    solids: buildSolids(level, door),
    sight: sightSolids(level, door),
    timeLeft: 180,
    roomValue: 0,
    totalValue: state ? state.totalValue : 0,
    frozen: false
  };
}

function resetGame() {
  startLevel(0);
  state.totalValue = 0;
}

function playerOverlapsExit(player, exit) {
  return player.x > exit.x - 6 && player.x < exit.x + exit.w + 6 &&
    player.y > exit.y - 6 && player.y < exit.y + exit.h + 6;
}

function updatePlaying(dt) {
  var C = HEIST_CONFIG;
  var p = state.player;
  var mv = inputMoveVector(input);
  p.sneaking = inputIsSneaking(input);
  p.pickHeld = inputPickHeld(input);
  p.moving = (mv.x !== 0 || mv.y !== 0);
  if (p.moving) {
    var speed = p.sneaking ? C.sneakSpeed : C.playerSpeed;
    moveCircleAgainstSolids(p, p.x + mv.x * speed * dt, p.y + mv.y * speed * dt,
      C.playerRadius, state.solids);
  }
  if (input.clickQueued) {
    input.clickQueued = false;
    throwDistraction(state.tools, input.clickX, input.clickY, state.guards, audio);
  }
  if (input.empQueued) {
    input.empQueued = false;
    fireEMP(state.tools, state.cameras, audio);
  }
  if (inputRestartPressed(input)) { startLevel(state.levelIndex); return; }

  updateTools(state.tools, dt, p, state.door, audio);
  if (state.door && state.door.open) {
    state.solids = buildSolids(state.level, state.door);
    state.sight = sightSolids(state.level, state.door);
  }

  state.roomValue += collectLootNearPlayer(state.loot, p, audio);

  var anySeen = false;
  for (var i = 0; i < state.guards.length; i++) {
    var g = state.guards[i];
    var wasSeeing = guardSeesPlayer(g, p, state.sight, p.sneaking) > 0;
    updateGuard(g, dt, p, state.sight, state.alarm, audio);
    if (wasSeeing) anySeen = true;
    if (guardCatchesPlayer(g, p)) { endCaught('A guard grabbed Vesper by the collar.'); return; }
  }
  for (i = 0; i < state.cameras.length; i++) {
    var cam = state.cameras[i];
    updateCamera(cam, dt);
    if (cameraSeesPlayer(cam, p, state.sight)) {
      anySeen = true;
      cam.seenFlash = 0.4;
    }
  }
  if (anySeen) {
    raiseAlarm(state.alarm, C.guardAlarmRate, dt);
    if (state.cameras.some(function (c) { return cameraSeesPlayer(c, p, state.sight); })) {
      raiseAlarm(state.alarm, C.cameraAlarmRate, dt);
    }
  } else {
    decayAlarm(state.alarm, dt);
  }
  if (state.alarm.value >= 70) {
    sirenCooldown -= dt;
    if (sirenCooldown <= 0) { audio.playSiren(); sirenCooldown = 1.6; }
  }
  if (alarmIsTripped(state.alarm)) { endCaught('The alarm hit 100% and the shutters slammed down.'); return; }

  state.timeLeft -= dt;
  if (state.timeLeft <= 0) { endCaught('The shift change arrived and the gallery filled with guards.'); return; }

  if (lootTakenCount(state.loot) >= state.level.lootRequired &&
      playerOverlapsExit(p, state.level.exit)) {
    state.totalValue += state.roomValue;
    if (state.levelIndex + 1 >= LEVELS.length) {
      state.phase = 'gameClear';
      audio.playWin();
    } else {
      state.phase = 'roomClear';
      audio.playWin();
    }
  }
}

function endCaught(reason) {
  state.phase = 'caught';
  state.caughtReason = reason;
  audio.playCaught();
}

function update(dt) {
  if (state.phase === 'title') {
    if (input.anyKey) { input.anyKey = false; audio.ensure(); audio.startMusic(); startLevel(0); }
    return;
  }
  if (state.phase === 'playing') { updatePlaying(dt); input.anyKey = false; return; }
  if (state.phase === 'caught') {
    if (inputRestartPressed(input) || input.anyKey) { input.anyKey = false; startLevel(state.levelIndex); }
    return;
  }
  if (state.phase === 'roomClear') {
    if (input.anyKey) { input.anyKey = false; startLevel(state.levelIndex + 1); }
    return;
  }
  if (state.phase === 'gameClear') {
    if (inputRestartPressed(input) || input.anyKey) { input.anyKey = false; resetGame(); }
  }
}

function frame(now) {
  var dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  if (state.frozen) {
    renderGame(ctx, state, 1.234);
  } else {
    update(dt);
    renderGame(ctx, state, now / 1000);
  }
  window.requestAnimationFrame(frame);
}

// Screenshot poses: deterministic staged states of the real game, for ?shot=1..4.
function applyShot(n) {
  resetGame();
  if (n === 1) {
    startLevel(0);
    state.player.x = 430; state.player.y = 540;
    state.guards[0].x = 280; state.guards[0].y = 300; state.guards[0].facing = Math.PI / 2;
    state.guards[1].x = 1050; state.guards[1].y = 420; state.guards[1].facing = -Math.PI / 2;
    state.alarm.value = 35;
    state.loot[0].taken = true;
    state.roomValue = 400;
  } else if (n === 2) {
    startLevel(1);
    state.player.x = 600; state.player.y = 402;
    state.door.open = true;
    state.solids = buildSolids(state.level, state.door);
    state.sight = sightSolids(state.level, state.door);
    state.cameras[0].disabledLeft = 5;
    state.cameras[1].disabledLeft = 5;
    state.alarm.value = 12;
    state.loot[0].taken = true; state.loot[1].taken = true;
    state.roomValue = 1150;
    state.tools.emp = 1;
    state.guards[1].x = 480; state.guards[1].y = 300; state.guards[1].facing = 0;
  } else if (n === 3) {
    startLevel(2);
    state.player.x = 700; state.player.y = 430;
    state.guards[1].x = 770; state.guards[1].y = 330; state.guards[1].facing = Math.PI / 2;
    state.guards[1].alerted = true;
    state.guards[1].suspicion = 88;
    state.guards[1].alertTarget = { x: 700, y: 430 };
    state.alarm.value = 78;
    state.loot[0].taken = true; state.loot[1].taken = true; state.loot[4].taken = true;
    state.roomValue = 3800;
    state.tools.coins = 1;
  } else if (n === 4) {
    startLevel(2);
    state.phase = 'gameClear';
    state.totalValue = 9800;
    state.alarm.peak = 41;
    state.loot.forEach(function (l) { l.taken = true; });
  }
  state.frozen = true;
}

function init() {
  var params = new URLSearchParams(window.location.search);
  var shot = parseInt(params.get('shot') || '0', 10);
  state = { phase: 'title', level: LEVELS[0], levelIndex: 0, player: { x: 90, y: 640, sneaking: false, moving: false, pickHeld: false }, guards: [], cameras: [], loot: [], alarm: makeAlarm(), tools: makeTools(), door: null, solids: [], sight: [], timeLeft: 180, roomValue: 0, totalValue: 0, frozen: false };
  if (shot >= 1 && shot <= 4) applyShot(shot);
  window.__heist = {
    state: function () { return state; },
    phase: function () { return state.phase; },
    alarm: function () { return Math.round(state.alarm.value); },
    lootCount: function () { return lootTakenCount(state.loot); },
    startLevel: startLevel,
    resetGame: resetGame
  };
  window.requestAnimationFrame(frame);
}

init();
