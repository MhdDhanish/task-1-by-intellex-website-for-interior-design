import { schemaTypes } from './schemaTypes'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'fenyx-interiors',
  title: 'Fenyx Interiors — CMS',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Portfolio Projects')
              .child(
                S.documentTypeList('project')
                  .title('Portfolio Projects')
                  .defaultOrdering([{ field: 'year', direction: 'desc' }])
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
