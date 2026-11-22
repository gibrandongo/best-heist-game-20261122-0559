// loot.js — one job: the loot. What it is, what it is worth, when it is taken.
function makeLoot(def) {
  return {
    x: def.x,
    y: def.y,
    kind: def.kind,
    value: def.value,
    taken: false,
    bob: Math.random() * Math.PI * 2
  };
}

function lootIsReachable(loot, player) {
  var dx = loot.x - player.x, dy = loot.y - player.y;
  return Math.sqrt(dx * dx + dy * dy) < 30;
}

function collectLootNearPlayer(lootList, player, audio) {
  var gained = 0;
  for (var i = 0; i < lootList.length; i++) {
    var l = lootList[i];
    if (!l.taken && lootIsReachable(l, player)) {
      l.taken = true;
      gained += l.value;
      audio.playPickup();
    }
  }
  return gained;
}

function lootTakenCount(lootList) {
  var n = 0;
  for (var i = 0; i < lootList.length; i++) if (lootList[i].taken) n++;
  return n;
}

function lootTotalValue(lootList) {
  var v = 0;
  for (var i = 0; i < lootList.length; i++) if (lootList[i].taken) v += lootList[i].value;
  return v;
}
