import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', (p) => p.data.lang === 'it' && !p.data.draft && !p.data.hidden))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: 'Luigi Bifulco — Blog',
    description: 'Blog di Luigi Bifulco: sviluppo software, web e dintorni.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.data.translationKey}/`,
    })),
  });
}
