// audio.js — one job: every sound, synthesized live with WebAudio. No audio files.
// A soft midnight-jazz pulse under the game, chimes for loot, a siren as the alarm climbs.
function makeAudio() {
  var audio = {
    ctx: null,
    musicOn: false,
    musicTimer: null,
    muted: false,
    ensure: function () {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone: function (freq, dur, type, vol, when) {
      if (this.muted) return;
      var ctx = this.ensure();
      if (!ctx) return;
      var t = ctx.currentTime + (when || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    },
    playPickup: function () {
      this.tone(880, 0.12, 'sine', 0.10);
      this.tone(1318, 0.18, 'sine', 0.08, 0.07);
    },
    playCoin: function () {
      this.tone(1568, 0.09, 'triangle', 0.07);
      this.tone(1046, 0.12, 'triangle', 0.06, 0.06);
    },
    playAlert: function () {
      this.tone(220, 0.16, 'square', 0.06);
      this.tone(311, 0.22, 'square', 0.06, 0.14);
    },
    playSiren: function () {
      this.tone(660, 0.25, 'sawtooth', 0.045);
      this.tone(440, 0.25, 'sawtooth', 0.045, 0.25);
    },
    playEMP: function () {
      this.tone(180, 0.3, 'sawtooth', 0.07);
      this.tone(90, 0.4, 'sine', 0.08, 0.1);
    },
    playUnlock: function () {
      this.tone(523, 0.1, 'triangle', 0.08);
      this.tone(784, 0.16, 'triangle', 0.08, 0.09);
    },
    playCaught: function () {
      this.tone(392, 0.2, 'square', 0.09);
      this.tone(262, 0.3, 'square', 0.09, 0.18);
      this.tone(196, 0.5, 'square', 0.09, 0.38);
    },
    playWin: function () {
      var notes = [523, 659, 784, 1046];
      for (var i = 0; i < notes.length; i++) this.tone(notes[i], 0.22, 'triangle', 0.09, i * 0.12);
    },
    playDeny: function () { this.tone(160, 0.12, 'square', 0.06); },
    startMusic: function () {
      if (this.musicOn) return;
      this.musicOn = true;
      var self = this;
      var bass = [110, 0, 130.8, 0, 98, 0, 146.8, 0];
      var step = 0;
      this.musicTimer = window.setInterval(function () {
        if (self.muted) return;
        var f = bass[step % bass.length];
        if (f) self.tone(f, 0.5, 'triangle', 0.035);
        if (step % 4 === 2) self.tone(220 + (step % 8) * 8, 0.18, 'sine', 0.02);
        step++;
      }, 420);
    },
    stopMusic: function () {
      if (this.musicTimer) window.clearInterval(this.musicTimer);
      this.musicTimer = null;
      this.musicOn = false;
    }
  };
  return audio;
}
