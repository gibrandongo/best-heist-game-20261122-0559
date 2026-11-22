// guards.js — one job: the night guards. Patrol, suspicion, alert chase, catch.
function makeGuard(def) {
  return {
    x: def.waypoints[0].x,
    y: def.waypoints[0].y,
    waypoints: def.waypoints,
    targetIndex: 1 % def.waypoints.length,
    pause: def.pause || 1,
    pauseLeft: 0,
    facing: Math.PI / 2,
    suspicion: 0,
    alerted: false,
    alertTarget: null,
    investigateLeft: 0,
    stuckTime: 0
  };
}

function guardSeesPlayer(guard, player, solids, sneaking) {
  var factor = sneaking ? HEIST_CONFIG.sneakDetectFactor : 1;
  var range = HEIST_CONFIG.coneRange * (sneaking ? 0.8 : 1);
  if (!pointInVisionCone(player.x, player.y, guard.x, guard.y, guard.facing,
      HEIST_CONFIG.coneHalfAngle, range, solids)) return 0;
  return HEIST_CONFIG.detectRate * factor;
}

function moveCircleAgainstSolids(ent, nx, ny, radius, solids) {
  var moved = { x: ent.x, y: ent.y };
  var tryX = { x: nx, y: ent.y };
  if (!circleHitsSolids(tryX.x, tryX.y, radius, solids)) moved.x = nx;
  var tryY = { x: moved.x, y: ny };
  if (!circleHitsSolids(tryY.x, tryY.y, radius, solids)) moved.y = ny;
  ent.x = moved.x;
  ent.y = moved.y;
}

function circleHitsSolids(x, y, radius, solids) {
  for (var i = 0; i < solids.length; i++) {
    var r = solids[i];
    var cx = Math.max(r.x, Math.min(x, r.x + r.w));
    var cy = Math.max(r.y, Math.min(y, r.y + r.h));
    var dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

function updateGuard(guard, dt, player, solids, alarm, audio) {
  var C = HEIST_CONFIG;
  var seen = guardSeesPlayer(guard, player, solids, player.sneaking);
  if (seen > 0) {
    guard.suspicion = Math.min(100, guard.suspicion + seen * dt);
    guard.alertTarget = { x: player.x, y: player.y };
    if (guard.suspicion >= C.suspicionAlertAt && !guard.alerted) {
      guard.alerted = true;
      guard.investigateLeft = 5;
      audio.playAlert();
    }
  } else {
    guard.suspicion = Math.max(0, guard.suspicion - 22 * dt);
    if (guard.alerted) {
      guard.investigateLeft -= dt;
      if (guard.investigateLeft <= 0) {
        guard.alerted = false;
        guard.alertTarget = null;
      }
    }
  }

  var speed = C.guardSpeed;
  var tx, ty;
  if (guard.alerted && guard.alertTarget) {
    speed = C.guardChaseSpeed;
    tx = guard.alertTarget.x;
    ty = guard.alertTarget.y;
  } else {
    var wp = guard.waypoints[guard.targetIndex];
    tx = wp.x;
    ty = wp.y;
  }

  var dx = tx - guard.x, dy = ty - guard.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 6) {
    if (guard.alerted) {
      guard.alertTarget = null;
      guard.alerted = false;
    } else if (guard.pauseLeft <= 0) {
      guard.pauseLeft = guard.pause;
    }
  }
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    if (guard.pauseLeft <= 0 && !guard.alerted) {
      guard.targetIndex = (guard.targetIndex + 1) % guard.waypoints.length;
    }
    return;
  }
  if (dist > 0.5) {
    var step = Math.min(dist, speed * dt);
    var nx = guard.x + (dx / dist) * step;
    var ny = guard.y + (dy / dist) * step;
    guard.facing = Math.atan2(dy, dx);
    moveCircleAgainstSolids(guard, nx, ny, C.guardRadius, solids);
  }
}

function guardCatchesPlayer(guard, player) {
  var dx = guard.x - player.x, dy = guard.y - player.y;
  return Math.sqrt(dx * dx + dy * dy) < HEIST_CONFIG.catchDistance;
}
