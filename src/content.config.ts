import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['it', 'en']),
    translationKey: z.string(),
    headerImage: z.string().optional(),
    draft: z.boolean().default(false),
    // hidden: l'articolo può essere committato/pushato ma non viene generato
    // affatto: nessuna pagina, escluso da liste, RSS e switch lingua.
    hidden: z.boolean().default(false),
  }),
});

export const collections = { blog };
