/* ==========================================================================
   FENYX INTERIORS — SANITY API CLIENT
   Fetches published content from Sanity Content Lake via the CDN.
   Replace the SANITY_PROJECT_ID and SANITY_DATASET values below
   with your actual Sanity project credentials.
   ========================================================================== */

const SANITY_CONFIG = {
  projectId: '13dmd56z',   // <-- Replace with your Sanity Project ID
  dataset: 'production',           // <-- Replace if using a different dataset
  apiVersion: '2024-01-01',
  useCdn: true,                    // Use Sanity CDN for fast public reads
};

/**
 * Execute a GROQ query against Sanity and return the results.
 * @param {string} query - A GROQ query string
 * @param {Object} params - Optional query parameters
 * @returns {Promise<any>}
 */
async function sanityFetch(query, params = {}) {
  const { projectId, dataset, apiVersion, useCdn } = SANITY_CONFIG;
  const subdomain = useCdn ? 'cdn' : 'api';
  const baseUrl = `https://${projectId}.${subdomain}.sanity.io/v${apiVersion}/data/query/${dataset}`;

  const encodedQuery = encodeURIComponent(query);
  let url = `${baseUrl}?query=${encodedQuery}`;

  // Append GROQ params if any
  Object.entries(params).forEach(([key, value]) => {
    url += `&${encodeURIComponent('$' + key)}=${encodeURIComponent(JSON.stringify(value))}`;
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Sanity fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Build a Sanity image URL from an image reference object.
 * Supports hotspot/crop via Sanity's image CDN URL pattern.
 *
 * @param {Object} imageRef - Sanity image object with _ref inside asset
 * @param {Object} options - { width, height, quality, format }
 * @returns {string} Full Sanity CDN image URL
 */
function sanityImageUrl(imageRef, options = {}) {
  if (!imageRef || !imageRef.asset || !imageRef.asset._ref) {
    return '';
  }

  const { projectId, dataset } = SANITY_CONFIG;
  const ref = imageRef.asset._ref;

  // Parse the Sanity image reference: image-{id}-{width}x{height}-{format}
  const [, id, dimensions, format] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) || [];
  if (!id) return '';

  const [origWidth, origHeight] = dimensions ? dimensions.split('x').map(Number) : [0, 0];

  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;

  const params = [];
  if (options.width) params.push(`w=${options.width}`);
  if (options.height) params.push(`h=${options.height}`);
  if (options.quality) params.push(`q=${options.quality}`);
  if (options.format) params.push(`fm=${options.format}`);
  if (options.fit) params.push(`fit=${options.fit}`);

  // Apply hotspot crop if available
  if (imageRef.hotspot && imageRef.crop) {
    const { x, y } = imageRef.hotspot;
    params.push(`fp-x=${x.toFixed(3)}&fp-y=${y.toFixed(3)}&fp-z=1`);
  }

  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  return url;
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.FenyxSanity = { fetch: sanityFetch, imageUrl: sanityImageUrl, config: SANITY_CONFIG };
}
