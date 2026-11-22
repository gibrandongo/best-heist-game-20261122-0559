// render.js — one job: draw everything. The gallery, the cones, the thief, the HUD.
// Look: a midnight gallery — deep blue marble, gold loot, red cones, a purple thief.
function drawRoom(ctx, level, solids) {
  var C = HEIST_CONFIG.colors;
  ctx.fillStyle = C.floor;
  ctx.fillRect(8, 72, 1264, 640);
  ctx.fillStyle = C.floorAlt;
  for (var ty = 72; ty < 712; ty += 80) {
    for (var tx = 8; tx < 1272; tx += 80) {
      if (((tx + ty) / 80) % 2 === 0) ctx.fillRect(tx, ty, 80, 80);
    }
  }
  ctx.fillStyle = C.carpet;
  ctx.fillRect(90, 330, 1100, 90);
  ctx.fillStyle = 'rgba(245,197,66,0.12)';
  ctx.fillRect(90, 330, 1100, 4);
  ctx.fillRect(90, 416, 1100, 4);
  var i, r;
  for (i = 0; i < level.cover.length; i++) {
    r = level.cover[i];
    ctx.fillStyle = C.cover;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = C.wallTop;
    ctx.fillRect(r.x, r.y, r.w, 5);
    ctx.fillStyle = C.muted;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(r.label, r.x + r.w / 2, r.y + r.h / 2 + 4);
  }
  for (i = 0; i < level.walls.length; i++) {
    r = level.walls[i];
    ctx.fillStyle = C.wall;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = C.wallTop;
    if (r.w >= r.h) ctx.fillRect(r.x, r.y, r.w, 4);
    else ctx.fillRect(r.x, r.y, 4, r.h);
  }
}

function drawVisionCone(ctx, ox, oy, facing, halfAngle, range, solids, fill) {
  var pts = conePolygonPoints(ox, oy, facing, halfAngle, range, solids);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawLoot(ctx, lootList, time) {
  var C = HEIST_CONFIG.colors;
  for (var i = 0; i < lootList.length; i++) {
    var l = lootList[i];
    if (l.taken) continue;
    var bob = Math.sin(time * 2 + l.bob) * 3;
    ctx.save();
    ctx.translate(l.x, l.y + bob);
    ctx.fillStyle = 'rgba(245,197,66,0.18)';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 11);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(-2, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = C.goldGlow;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$' + l.value, l.x, l.y + 30 + bob);
  }
}

function drawGuards(ctx, guards, solids) {
  var C = HEIST_CONFIG.colors;
  for (var i = 0; i < guards.length; i++) {
    var g = guards[i];
    var fill = g.alerted ? C.coneAlert : C.cone;
    drawVisionCone(ctx, g.x, g.y, g.facing, HEIST_CONFIG.coneHalfAngle,
      HEIST_CONFIG.coneRange, solids, fill);
  }
  for (i = 0; i < guards.length; i++) {
    g = guards[i];
    ctx.fillStyle = g.alerted ? '#ff2e4d' : C.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, HEIST_CONFIG.guardRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.facing) * 6, g.y + Math.sin(g.facing) * 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.guardDark;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GUARD', g.x, g.y - 20);
    if (g.suspicion > 5) {
      ctx.fillStyle = '#1a0d0d';
      ctx.fillRect(g.x - 18, g.y - 34, 36, 6);
      ctx.fillStyle = g.suspicion > 62 ? '#ff2e4d' : C.gold;
      ctx.fillRect(g.x - 18, g.y - 34, 36 * (g.suspicion / 100), 6);
    }
    if (g.alerted) {
      ctx.fillStyle = '#ff2e4d';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('!', g.x, g.y - 40);
    }
  }
}

function drawCameras(ctx, cameras, solids) {
  var C = HEIST_CONFIG.colors;
  for (var i = 0; i < cameras.length; i++) {
    var cam = cameras[i];
    var off = cam.disabledLeft > 0;
    var fill = off ? C.cameraConeOff : C.cameraCone;
    if (!off) {
      drawVisionCone(ctx, cam.x, cam.y, cam.angle, HEIST_CONFIG.cameraHalfAngle,
        HEIST_CONFIG.cameraRange, solids, fill);
    }
    ctx.fillStyle = off ? '#5a6a8a' : C.camera;
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = off ? '#8a97b5' : '#1a0d0d';
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 5, cam.y + Math.sin(cam.angle) * 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = off ? '#8a97b5' : C.camera;
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(off ? 'CAM OFF' : 'CAM', cam.x, cam.y - 15);
  }
}

function drawThief(ctx, player, time) {
  var C = HEIST_CONFIG.colors;
  var bob = player.moving ? Math.sin(time * 12) * 1.5 : 0;
  ctx.save();
  ctx.translate(player.x, player.y + bob);
  ctx.fillStyle = 'rgba(183,140,255,0.20)';
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.thief;
  ctx.beginPath();
  ctx.arc(0, 0, HEIST_CONFIG.playerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.thiefDark;
  ctx.beginPath();
  ctx.arc(0, -3, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-4, -4, 2, 0, Math.PI * 2);
  ctx.arc(4, -4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.thief;
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(player.sneaking ? 'VESPER · SNEAKING' : 'VESPER', player.x, player.y - 22);
}

function drawExitAndDoor(ctx, level, door, lootReady) {
  var C = HEIST_CONFIG.colors;
  var e = level.exit;
  ctx.fillStyle = lootReady ? '#1f7a4d' : '#274a63';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = lootReady ? C.safe : '#5a7a9a';
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = lootReady ? C.safe : '#9fb8d8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GETAWAY', e.x + e.w / 2, e.y + e.h / 2 - 4);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(lootReady ? 'GO!' : 'need loot', e.x + e.w / 2, e.y + e.h / 2 + 14);
  if (door && !door.open) {
    ctx.fillStyle = '#6b4a1f';
    ctx.fillRect(door.x - 4, door.y - 4, door.w + 8, door.h + 8);
    ctx.fillStyle = C.gold;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('LOCKED — hold E', door.x + door.w / 2, door.y - 10);
  }
}

function drawDistraction(ctx, distraction) {
  if (!distraction) return;
  var pulse = 1 + Math.sin(Date.now() / 90) * 0.25;
  ctx.strokeStyle = 'rgba(245,197,66,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(distraction.x, distraction.y, 12 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(distraction.x, distraction.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawHUD(ctx, state) {
  var C = HEIST_CONFIG.colors;
  ctx.fillStyle = '#0d1326';
  ctx.fillRect(0, 0, 1280, 64);
  ctx.fillStyle = 'rgba(245,197,66,0.25)';
  ctx.fillRect(0, 62, 1280, 2);
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE MIDNIGHT VAULT', 20, 28);
  ctx.fillStyle = C.muted;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(state.level.name, 20, 48);
  var bx = 560, by = 16, bw = 300, bh = 22;
  ctx.fillStyle = '#1a0d0d';
  ctx.fillRect(bx, by, bw, bh);
  var band = alarmBand(state.alarm);
  var fill = band === 'calm' ? C.alarmLow : band === 'hot' ? C.alarmMid : C.alarmHigh;
  ctx.fillStyle = fill;
  ctx.fillRect(bx, by, bw * (state.alarm.value / 100), bh);
  ctx.strokeStyle = '#e8ecf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALARM ' + Math.round(state.alarm.value) + '%', bx + bw / 2, by + 16);
  ctx.fillStyle = state.alarm.value >= 70 ? C.danger : C.muted;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText(state.alarm.value >= 70 ? 'THEY KNOW YOU ARE HERE' :
    state.alarm.value >= 35 ? 'SOMETHING IS WRONG…' : 'UNDETECTED', bx + bw / 2, by + 38);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.text;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('LOOT ' + lootTakenCount(state.loot) + '/' + state.level.lootRequired +
    '   $' + lootTotalValue(state.loot), 920, 26);
  ctx.fillStyle = C.muted;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('COINS ' + state.tools.coins + '   EMP ' + state.tools.emp +
    '   TIME ' + Math.floor(state.timeLeft) + 's', 920, 46);
  if (state.tools.lockpicking) {
    var px = state.player.x - 30, py = state.player.y - 44;
    ctx.fillStyle = '#1a0d0d';
    ctx.fillRect(px, py, 60, 8);
    ctx.fillStyle = C.gold;
    ctx.fillRect(px, py, 60 * state.tools.lockpickProgress, 8);
    ctx.fillStyle = C.gold;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PICKING LOCK…', state.player.x, py - 6);
  }
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(8,10,24,0.88)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#f5c542';
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE MIDNIGHT VAULT', 640, 210);
  ctx.fillStyle = '#b78cff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('a Velvet Fox heist in three rooms', 640, 258);
  ctx.fillStyle = '#e8ecf8';
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('Vesper Fox is inside the Gilded Gallery. Lift the loot, dodge the cones,', 640, 330);
  ctx.fillText('silence the cameras, and slip out the blue getaway door — before the alarm hits 100%.', 640, 356);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('WASD / arrows — move      SHIFT — sneak      CLICK — throw a coin      E — pick a lock      Q — EMP', 640, 420);
  ctx.fillStyle = '#39d98a';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('PRESS ANY KEY TO BEGIN THE HEIST', 640, 490);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Three rooms. Every room has two routes, tools that cost, and patrols you must read first.', 640, 540);
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8,10,24,0.82)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = accent;
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 640, 280);
  ctx.fillStyle = '#e8ecf8';
  ctx.font = '18px system-ui, sans-serif';
  for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], 640, 340 + i * 32);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Press R to try the room again — or any key to continue', 640, 340 + lines.length * 32 + 30);
}

function renderGame(ctx, state, time) {
  ctx.clearRect(0, 0, 1280, 720);
  if (state.phase === 'title') { drawTitle(ctx); return; }
  var solids = state.solids;
  drawRoom(ctx, state.level, solids);
  drawLoot(ctx, state.loot, time);
  drawExitAndDoor(ctx, state.level, state.door, lootTakenCount(state.loot) >= state.level.lootRequired);
  drawGuards(ctx, state.guards, solids);
  drawCameras(ctx, state.cameras, solids);
  drawDistraction(ctx, state.tools.distraction);
  drawThief(ctx, state.player, time);
  drawHUD(ctx, state);
  if (state.phase === 'caught') {
    drawOverlay(ctx, 'BUSTED!', [
      'The alarm hit 100% and the night watch locked the gallery down.',
      'Loot kept: $' + lootTotalValue(state.loot) + '  ·  Alarm peak: ' + Math.round(state.alarm.peak) + '%'
    ], '#ff5470');
  } else if (state.phase === 'roomClear') {
    drawOverlay(ctx, 'CLEAN GETAWAY!', [
      'Room cleared with $' + state.roomValue + ' of loot and the alarm at ' + Math.round(state.alarm.value) + '%.',
      'The next room is darker, busier, and better guarded.'
    ], '#39d98a');
  } else if (state.phase === 'gameClear') {
    drawOverlay(ctx, 'THE VAULT IS EMPTY!', [
      'Vesper Fox walks out with $' + state.totalValue + ' and the whole gallery wondering',
      'how the crown jewels vanished without a single alarm tripping past ' + Math.round(state.alarm.peak) + '%.',
      'Three rooms. Zero fingerprints. One legend.'
    ], '#f5c542');
  }
}
