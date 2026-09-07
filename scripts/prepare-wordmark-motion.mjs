import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const destination = new URL('motion/wordmark/', root);
await mkdir(new URL('assets/', destination), { recursive: true });
for (const file of ['wordmark-motion.mjs', 'siamo-wordmark-black.png']) {
  await copyFile(new URL(`public/brand/${file}`, root), new URL(`assets/${file}`, destination));
}
const renderer = (await readFile(new URL('public/brand/wordmark-motion.mjs', root), 'utf8')).replaceAll('export ', '');
const bitmap = await readFile(new URL('public/brand/siamo-wordmark-black.png', root));
const template = await readFile(new URL('motion/wordmark/preview-template.html', root), 'utf8');
await writeFile(new URL('preview.html', destination), template.replace('/* RENDERER */', renderer).replace('LOGO_DATA', `data:image/png;base64,${bitmap.toString('base64')}`));
