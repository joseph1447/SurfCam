// One-off: publish a hand-cut clip to @eltrillo_santateresa as a "best wave" Reel + Story.
// Usage: npx tsx scripts/publish-ig-clip.ts <file.mp4> <capture ISO time> [--dry]
import 'dotenv/config';
import { readFileSync } from 'fs';

async function main() {
  const [file, atIso, ...flags] = process.argv.slice(2);
  const at = new Date(atIso).getTime();
  const { getSurfReport } = await import('@/lib/conditions');
  const { reelCaption } = await import('@/lib/copy');
  const report = await getSurfReport(at).catch(() => null);
  const caption = reelCaption({ kind: 'best', report, at });
  console.log(caption);
  if (flags.includes('--dry')) return;

  const { publishReel, publishStory } = await import('@/lib/instagram');
  const video = readFileSync(file);
  const name = `best-manual-${atIso.replace(/\D/g, '').slice(0, 12)}`;
  console.log('reel', await publishReel({ video, caption, name, thumbnailOffsetMs: 5000 }));
  console.log('story', await publishStory({ video, name }));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
