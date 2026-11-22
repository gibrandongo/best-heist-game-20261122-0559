// cameras.js — one job: the wall cameras. They sweep, they see, they feed the alarm.
// An EMP pulse freezes a camera grey and blind for a few seconds.
function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep || 0.9,
    angle: def.baseAngle,
    sweepTime: Math.random() * 6,
    disabledLeft: 0,
    seenFlash: 0
  };
}

function updateCamera(camera, dt) {
  if (camera.disabledLeft > 0) {
    camera.disabledLeft -= dt;
    return;
  }
  camera.sweepTime += dt;
  camera.angle = camera.baseAngle +
    Math.sin(camera.sweepTime * HEIST_CONFIG.cameraSweepSpeed) * camera.sweep;
  if (camera.seenFlash > 0) camera.seenFlash -= dt;
}

function cameraSeesPlayer(camera, player, solids) {
  if (camera.disabledLeft > 0) return false;
  return pointInVisionCone(player.x, player.y, camera.x, camera.y, camera.angle,
    HEIST_CONFIG.cameraHalfAngle, HEIST_CONFIG.cameraRange, solids);
}
