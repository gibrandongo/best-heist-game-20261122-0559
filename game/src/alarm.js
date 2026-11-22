// alarm.js — one job: the alarm meter. It rises when you are seen, falls when hidden.
// At 100 the night watch locks the building down and the heist is over.
function makeAlarm() {
  return { value: 0, peak: 0, trips: 0 };
}

function raiseAlarm(alarm, amount, dt) {
  if (amount <= 0) return;
  var before = alarm.value;
  alarm.value = Math.min(100, alarm.value + amount * dt);
  if (alarm.value > alarm.peak) alarm.peak = alarm.value;
  if (before < 50 && alarm.value >= 50) alarm.trips++;
}

function decayAlarm(alarm, dt) {
  alarm.value = Math.max(0, alarm.value - HEIST_CONFIG.alarmDecay * dt);
}

function alarmIsTripped(alarm) {
  return alarm.value >= HEIST_CONFIG.alarmCaughtAt;
}

function alarmBand(alarm) {
  if (alarm.value < 35) return 'calm';
  if (alarm.value < 70) return 'hot';
  return 'critical';
}
