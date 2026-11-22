// vision.js — one job: sight geometry. Cones, raycasts and line of sight.
// Walls and closed doors block sight; low cover does NOT block sight, it only
// hides the thief when the thief stands directly behind it from the watcher.
function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  var dx = x2 - x1, dy = y2 - y1;
  var tmin = 0, tmax = 1;
  var p, q;
  var axes = [
    { p: -dx, q: x1 - r.x },
    { p: dx, q: r.x + r.w - x1 },
    { p: -dy, q: y1 - r.y },
    { p: dy, q: r.y + r.h - y1 }
  ];
  for (var i = 0; i < 4; i++) {
    p = axes[i].p; q = axes[i].q;
    if (p === 0) { if (q < 0) return false; }
    else {
      var t = q / p;
      if (p < 0) { if (t > tmax) return false; if (t > tmin) tmin = t; }
      else { if (t < tmin) return false; if (t < tmax) tmax = t; }
    }
  }
  return true;
}

function rayDistance(ox, oy, angle, maxDist, solids) {
  var step = 6;
  var dx = Math.cos(angle), dy = Math.sin(angle);
  for (var d = step; d <= maxDist; d += step) {
    var x = ox + dx * d, y = oy + dy * d;
    for (var i = 0; i < solids.length; i++) {
      if (pointInRect(x, y, solids[i])) return d;
    }
  }
  return maxDist;
}

function hasLineOfSight(x1, y1, x2, y2, solids) {
  for (var i = 0; i < solids.length; i++) {
    if (segmentHitsRect(x1, y1, x2, y2, solids[i])) return false;
  }
  return true;
}

function angleDifference(a, b) {
  var d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function pointInVisionCone(px, py, ox, oy, facing, halfAngle, range, solids) {
  var dx = px - ox, dy = py - oy;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > range) return false;
  if (dist < 4) return true;
  var ang = Math.atan2(dy, dx);
  if (Math.abs(angleDifference(ang, facing)) > halfAngle) return false;
  return hasLineOfSight(ox, oy, px, py, solids);
}

function conePolygonPoints(ox, oy, facing, halfAngle, range, solids) {
  var pts = [{ x: ox, y: oy }];
  var steps = 26;
  for (var i = 0; i <= steps; i++) {
    var a = facing - halfAngle + (2 * halfAngle * i) / steps;
    var d = rayDistance(ox, oy, a, range, solids);
    pts.push({ x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d });
  }
  return pts;
}
