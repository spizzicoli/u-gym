// Collega il nome esercizio (scritto liberamente dal portale/PT) alla GIF dimostrativa giusta
// in /public/exercise-gifs/. Al contrario di una mappa con i nomi esatti, qui bastano alias
// parziali: "Squat con bilanciere", "squat libero" o "SQUAT" trovano comunque squat.gif.
const BASE = import.meta.env.BASE_URL || '/';

const GIFS = {
  'squat':              ['squat'],
  'panca-piana':        ['panca piana', 'panca', 'bench press', 'distensioni su panca'],
  'rematore':           ['rematore', 'bent over row', 'rowing con bilanciere'],
  'stacco-da-terra':    ['stacco da terra', 'stacco', 'deadlift'],
  'lento-avanti':       ['lento avanti', 'military press', 'shoulder press', 'overhead press', 'lento'],
  'trazioni':           ['trazioni', 'pull up', 'pull-up', 'chin up', 'trazioni alla sbarra'],
  'curl-bicipiti':      ['curl bicipiti', 'curl', 'bicipiti con bilanciere', 'bicipiti con manubri'],
  'flessioni':          ['flessioni', 'push up', 'push-up', 'piegamenti'],
  'affondi':            ['affondi', 'affondo', 'lunge'],
  'plank':              ['plank'],
  'crunch':             ['crunch', 'addominali'],
  'lat-machine':        ['lat machine', 'lat pulldown', 'pulldown', 'lat'],
  'leg-press':          ['leg press', 'pressa', 'pressa gambe'],
  'hip-thrust':         ['hip thrust', 'ponte glutei', 'glute bridge'],
  'pushdown-tricipiti': ['pushdown', 'push down', 'tricipiti ai cavi', 'tricipiti', 'french press'],
};

const normalize = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// alias più lunghi prima, così "panca piana" batte "panca" quando entrambi combaciano
const INDEX = Object.entries(GIFS)
  .flatMap(([slug, aliases]) => aliases.map((a) => [normalize(a), slug]))
  .sort((a, b) => b[0].length - a[0].length);

export function matchExerciseGifSlug(name) {
  const n = ` ${normalize(name)} `;
  const hit = INDEX.find(([alias]) => n.includes(` ${alias} `) || n.includes(alias));
  return hit ? hit[1] : null;
}

/**
 * Media dell'esercizio, in ordine di priorità:
 *  1. Foto reale da wger.de (gratis, CC-BY-SA) risolta dalla Cloud Function `resolveExercisePhoto`
 *     o dallo script `backfill-wger-photos.mjs` → exercise.photo_url. Va sempre mostrata con
 *     l'attribuzione (autore + licenza), obbligatoria per la licenza CC-BY-SA.
 *  2. gif_url impostato a mano dal portale.
 *  3. GIF disegnata inclusa nell'app (riserva, finché una foto non è stata risolta).
 */
export function resolveExerciseGif(exercise) {
  const slug = matchExerciseGifSlug(exercise?.name);
  return {
    slug,
    photo: exercise?.photo_url || null,
    photoAttribution: exercise?.photo_url
      ? {
          author: exercise.photo_author || 'comunità wger.de',
          license: exercise.photo_license || 'CC-BY-SA',
          licenseUrl: exercise.photo_license_url,
          sourceUrl: exercise.photo_source_url,
        }
      : null,
    gif: exercise?.gif_url || (slug ? `${BASE}exercise-gifs/${slug}.gif` : null),
    poster: slug ? `${BASE}exercise-gifs/${slug}.png` : null,
  };
}
