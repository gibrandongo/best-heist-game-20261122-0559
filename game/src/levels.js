// levels.js — one job: the three rooms of the heist, their walls, patrols and loot.
// Every room offers at least two routes: a loud open lane and a quiet cover lane.
function defineLevels() {
  var C = HEIST_CONFIG;
  return [
    {
      name: 'ROOM 1 — THE MARBLE GALLERY',
      brief: 'Slip past the night guards, lift the gallery pieces, reach the blue door.',
      playerStart: { x: 90, y: 640 },
      exit: { x: 1180, y: 120, w: 64, h: 76 },
      lootRequired: 3,
      walls: [
        { x: 8, y: 72, w: 1264, h: 14 },
        { x: 8, y: 698, w: 1264, h: 14 },
        { x: 8, y: 72, w: 14, h: 640 },
        { x: 1258, y: 72, w: 14, h: 640 },
        { x: 330, y: 240, w: 180, h: 26 },
        { x: 330, y: 470, w: 180, h: 26 },
        { x: 700, y: 150, w: 26, h: 220 },
        { x: 700, y: 420, w: 26, h: 220 },
        { x: 950, y: 300, w: 180, h: 26 }
      ],
      cover: [
        { x: 180, y: 330, w: 90, h: 60, label: 'STATUE' },
        { x: 560, y: 560, w: 110, h: 56, label: 'BENCH' },
        { x: 850, y: 130, w: 90, h: 56, label: 'PEDESTAL' },
        { x: 1050, y: 520, w: 110, h: 56, label: 'CRATE' }
      ],
      guards: [
        { waypoints: [{ x: 280, y: 160 }, { x: 280, y: 640 }, { x: 680, y: 640 }, { x: 680, y: 160 }], pause: 1.2 },
        { waypoints: [{ x: 900, y: 360 }, { x: 900, y: 600 }, { x: 1200, y: 600 }, { x: 1200, y: 360 }], pause: 0.9 }
      ],
      cameras: [
        { x: 640, y: 86, baseAngle: Math.PI / 2, sweep: 0.9 }
      ],
      loot: [
        { x: 250, y: 150, kind: 'jade idol', value: 400 },
        { x: 1150, y: 640, kind: 'gold mask', value: 600 },
        { x: 640, y: 390, kind: 'ruby brooch', value: 500 }
      ],
      lockedDoor: null
    },
    {
      name: 'ROOM 2 — THE VAULT CORRIDOR',
      brief: 'The vault door is locked — pick it (hold E) while the patrols sweep. Two lanes: the corridor or the office.',
      playerStart: { x: 90, y: 640 },
      exit: { x: 1180, y: 120, w: 64, h: 76 },
      lootRequired: 4,
      walls: [
        { x: 8, y: 72, w: 1264, h: 14 },
        { x: 8, y: 698, w: 1264, h: 14 },
        { x: 8, y: 72, w: 14, h: 640 },
        { x: 1258, y: 72, w: 14, h: 640 },
        { x: 300, y: 72, w: 26, h: 300 },
        { x: 300, y: 470, w: 26, h: 242 },
        { x: 640, y: 72, w: 26, h: 280 },
        { x: 640, y: 452, w: 26, h: 260 },
        { x: 900, y: 72, w: 26, h: 300 },
        { x: 900, y: 470, w: 26, h: 242 }
      ],
      cover: [
        { x: 120, y: 300, w: 100, h: 56, label: 'DESK' },
        { x: 420, y: 120, w: 100, h: 56, label: 'CABINET' },
        { x: 760, y: 560, w: 110, h: 56, label: 'SAFE' },
        { x: 1040, y: 300, w: 100, h: 56, label: 'PLANT' }
      ],
      guards: [
        { waypoints: [{ x: 260, y: 140 }, { x: 260, y: 620 }], pause: 1.0 },
        { waypoints: [{ x: 380, y: 200 }, { x: 600, y: 200 }, { x: 600, y: 560 }, { x: 380, y: 560 }], pause: 1.1 },
        { waypoints: [{ x: 1000, y: 200 }, { x: 1000, y: 600 }], pause: 0.8 }
      ],
      cameras: [
        { x: 480, y: 86, baseAngle: Math.PI / 2, sweep: 1.1 },
        { x: 1050, y: 698, baseAngle: -Math.PI / 2, sweep: 0.8 }
      ],
      loot: [
        { x: 160, y: 120, kind: 'pearl necklace', value: 700 },
        { x: 480, y: 390, kind: 'silver goblet', value: 450 },
        { x: 820, y: 390, kind: 'emerald ring', value: 800 },
        { x: 1150, y: 640, kind: 'gold bars', value: 900 }
      ],
      lockedDoor: { x: 640, y: 352, w: 26, h: 100, blocksLoot: true }
    },
    {
      name: 'ROOM 3 — THE GILDED VAULT',
      brief: 'The crown jewels. Three cameras, four guards, one getaway van waiting outside the blue door.',
      playerStart: { x: 90, y: 640 },
      exit: { x: 1180, y: 120, w: 64, h: 76 },
      lootRequired: 5,
      walls: [
        { x: 8, y: 72, w: 1264, h: 14 },
        { x: 8, y: 698, w: 1264, h: 14 },
        { x: 8, y: 72, w: 14, h: 640 },
        { x: 1258, y: 72, w: 14, h: 640 },
        { x: 260, y: 200, w: 200, h: 26 },
        { x: 260, y: 500, w: 200, h: 26 },
        { x: 560, y: 72, w: 26, h: 180 },
        { x: 560, y: 352, w: 26, h: 360 },
        { x: 820, y: 300, w: 200, h: 26 },
        { x: 820, y: 520, w: 200, h: 26 }
      ],
      cover: [
        { x: 120, y: 300, w: 100, h: 56, label: 'VAULT' },
        { x: 620, y: 300, w: 110, h: 56, label: 'PILLAR' },
        { x: 1050, y: 140, w: 100, h: 56, label: 'DISPLAY' },
        { x: 700, y: 600, w: 110, h: 56, label: 'CRATE' },
        { x: 1050, y: 560, w: 100, h: 56, label: 'STATUE' }
      ],
      guards: [
        { waypoints: [{ x: 240, y: 140 }, { x: 240, y: 620 }, { x: 500, y: 620 }, { x: 500, y: 140 }], pause: 0.9 },
        { waypoints: [{ x: 770, y: 140 }, { x: 770, y: 560 }], pause: 1.0 },
        { waypoints: [{ x: 1060, y: 240 }, { x: 1200, y: 240 }, { x: 1200, y: 480 }, { x: 1060, y: 480 }], pause: 0.8 },
        { waypoints: [{ x: 480, y: 390 }, { x: 520, y: 390 }, { x: 520, y: 640 }, { x: 480, y: 640 }], pause: 1.2 }
      ],
      cameras: [
        { x: 640, y: 86, baseAngle: Math.PI / 2, sweep: 1.0 },
        { x: 90, y: 390, baseAngle: 0, sweep: 0.9 },
        { x: 1190, y: 390, baseAngle: Math.PI, sweep: 0.9 }
      ],
      loot: [
        { x: 350, y: 150, kind: 'crown jewel', value: 1500 },
        { x: 640, y: 390, kind: 'sceptre', value: 1200 },
        { x: 950, y: 240, kind: 'diamond tiara', value: 1300 },
        { x: 1150, y: 640, kind: 'gold ingots', value: 1000 },
        { x: 180, y: 620, kind: 'sapphire egg', value: 1100 }
      ],
      lockedDoor: { x: 560, y: 252, w: 26, h: 100, blocksLoot: true }
    }
  ];
}
