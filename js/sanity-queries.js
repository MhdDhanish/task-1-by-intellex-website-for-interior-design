/* ==========================================================================
   FENYX INTERIORS — SANITY GROQ QUERIES
   All portfolio-related queries in a single file.
   ========================================================================== */

const SANITY_QUERIES = {

  /**
   * Fetch all published projects for the portfolio listing page.
   * Featured projects are returned first, then by year descending.
   */
  allProjects: `
    *[_type == "project"] | order(featured desc, year desc) {
      _id,
      title,
      "slug": slug.current,
      subtitle,
      category,
      tags,
      location,
      year,
      area,
      featured,
      shortDescription,
      coverImage {
        asset,
        hotspot,
        crop
      }
    }
  `,

  /**
   * Fetch only featured projects for the home page.
   */
  featuredProjects: `
    *[_type == "project" && featured == true] | order(year desc) [0...4] {
      _id,
      title,
      "slug": slug.current,
      subtitle,
      category,
      tags,
      location,
      year,
      area,
      shortDescription,
      coverImage {
        asset,
        hotspot,
        crop
      }
    }
  `,

  /**
   * Fetch a single project by slug for the project detail page.
   */
  projectBySlug: `
    *[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      subtitle,
      category,
      tags,
      location,
      year,
      area,
      timeline,
      scope,
      clientName,
      shortDescription,
      longDescription,
      clientBrief,
      result,
      materials,
      featured,
      coverImage {
        asset,
        hotspot,
        crop
      },
      galleryImages[] {
        asset,
        hotspot,
        crop,
        caption
      },
      beforeImages[] {
        asset,
        hotspot,
        crop
      },
      afterImages[] {
        asset,
        hotspot,
        crop
      },
      videoUrl,
      seoTitle,
      seoDescription
    }
  `,

  /**
   * Fetch slugs for all projects (used for pre-generating detail pages or sitemaps).
   */
  allSlugs: `
    *[_type == "project"] {
      "slug": slug.current
    }
  `,
};

if (typeof window !== 'undefined') {
  window.FenyxQueries = SANITY_QUERIES;
}
