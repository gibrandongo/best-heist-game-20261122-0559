// main.ts — the entrypoint: copies game/ and screenshots/ into the output
// directory and writes /output/dossier.json with buildDossier.
// Plain JavaScript syntax only, Node standard library only, no build step.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function clearOutputContents(dir) {
  mkdirSync(dir, { recursive: true });
  for (const child of readdirSync(dir)) {
    rmSync(join(dir, child), { recursive: true, force: true });
  }
}

function main() {
  clearOutputContents(outDir);
  cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  if (!existsSync(join(outDir, 'dossier.json'))) throw new Error('dossier.json was not written');
}

main();
