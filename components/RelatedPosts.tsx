import type { Circular } from '@/lib/data';
import CompactCircularRow from '@/components/CompactCircularRow';

// "Read more" block under a post: links readers (and search engines) on to
// other posts on the site.
export default function RelatedPosts({ posts }: { posts: Circular[] }) {
  if (posts.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-10 border-t border-rule pt-6">
      <h2
        id="related-heading"
        className="font-serif text-xl font-semibold text-ink mb-2 pl-3 border-l-4 border-maroon"
      >
        Read more
      </h2>
      <div className="divide-y divide-rule/60">
        {posts.map((p) => (
          <CompactCircularRow key={p.slug} circular={p} />
        ))}
      </div>
    </section>
  );
}
