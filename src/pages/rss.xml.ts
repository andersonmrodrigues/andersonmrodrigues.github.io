import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  
  return rss({
    title: 'Anderson Rodrigues - Engineering Articles',
    description: 'Technical writing on distributed systems, Clojure, Java, functional architecture, and AI workflows by Anderson Rodrigues.',
    site: context.site || 'https://andersonmaikrodrigues.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
