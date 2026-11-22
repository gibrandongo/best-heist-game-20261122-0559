// input.js — one job: keyboard and mouse. WASD/arrows move, Shift sneaks,
// click throws a coin, E picks locks, Q fires the EMP, R restarts the room.
function makeInput(canvas) {
  var input = {
    keys: {},
    mouseX: 0,
    mouseY: 0,
    clickX: null,
    clickY: null,
    clickQueued: false,
    empQueued: false,
    anyKey: false
  };
  window.addEventListener('keydown', function (e) {
    input.keys[e.key.toLowerCase()] = true;
    input.anyKey = true;
    if (e.key === 'q' || e.key === 'Q') input.empQueued = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) >= 0) e.preventDefault();
  });
  window.addEventListener('keyup', function (e) {
    input.keys[e.key.toLowerCase()] = false;
  });
  canvas.addEventListener('mousedown', function (e) {
    var rect = canvas.getBoundingClientRect();
    input.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    input.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    input.clickX = input.mouseX;
    input.clickY = input.mouseY;
    input.clickQueued = true;
    input.anyKey = true;
  });
  return input;
}

function inputMoveVector(input) {
  var x = 0, y = 0;
  if (input.keys['a'] || input.keys['arrowleft']) x -= 1;
  if (input.keys['d'] || input.keys['arrowright']) x += 1;
  if (input.keys['w'] || input.keys['arrowup']) y -= 1;
  if (input.keys['s'] || input.keys['arrowdown']) y += 1;
  if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
  return { x: x, y: y };
}

function inputIsSneaking(input) {
  return !!input.keys['shift'];
}

function inputPickHeld(input) {
  return !!input.keys['e'];
}

function inputRestartPressed(input) {
  return !!input.keys['r'];
}
