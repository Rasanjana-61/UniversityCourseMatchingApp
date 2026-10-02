import { sql } from "../config/db.js";
import { universityBanners } from "../config/university-banners.js";

// Validate all images before changing the six selected university records.
await Promise.all(universityBanners.map(async ({ shortName, imageUrl }) => {
  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
    throw new Error(
      `Cannot load the ${shortName} banner (HTTP ${response.status}).`,
    );
  }
  await response.arrayBuffer();
}));

const shortNames = universityBanners.map(({ shortName }) => shortName);
const universities = await sql`
  SELECT short_name FROM universities WHERE short_name = ANY(${shortNames}::text[]);
`;
const missing = shortNames.filter((shortName) =>
  !universities.some((university) => university.short_name === shortName),
);
if (missing.length) {
  throw new Error(`Universities not found: ${missing.join(", ")}`);
}

const updated = await sql.transaction(universityBanners.map(({ shortName, imageUrl }) => sql`
  UPDATE universities
  SET background_image_url = ${imageUrl}
  WHERE short_name = ${shortName}
  RETURNING id, name, short_name, background_image_url;
`));
console.table(updated.flat());
