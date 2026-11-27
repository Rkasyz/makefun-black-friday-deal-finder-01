// FridayFinds entry program: copies the site and its screenshots into the
// output directory and writes dossier.json with the kit's dossier builder.
// Runs on plain Node 22 with no flags, no build and no install:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : '/output';

function copyFresh(source, target) {
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyFresh(join(repoRoot, 'app'), join(outputDir, 'app'));
copyFresh(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});

const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, dossier);
console.log(`wrote ${dossierPath} (${dossier.length} bytes)`);
