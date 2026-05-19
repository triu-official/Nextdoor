import { useEffect, useState } from 'react';
import { createPost, getFeed, upvotePost, type FeedPost } from '../api/feedApi';
import { PostCard } from '../components/PostCard';
import { useUserContext } from '../context/UserContext';

const radiusOptions = [1, 3, 5];

export function LocalFeedPage() {
  const { user, feedRadiusKm, setFeedRadiusKm } = useUserContext();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [tag, setTag] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  async function loadFeed(): Promise<void> {
    if (!user) {
      return;
    }
    const response = await getFeed(user.id, feedRadiusKm, tag || undefined);
    setPosts(response.items);
  }

  useEffect(() => {
    void loadFeed();
  }, [user?.id, feedRadiusKm, tag]);

  if (!user) {
    return <div className="screen">Please complete onboarding.</div>;
  }

  return (
    <section className="screen">
      <h2>Local Feed</h2>
      <div className="chips">
        {radiusOptions.map((radius) => (
          <button key={radius} className={radius === feedRadiusKm ? 'chip active' : 'chip'} onClick={() => setFeedRadiusKm(radius)}>
            {radius}km
          </button>
        ))}
        <input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Filter by tag" />
      </div>

      <form
        className="card stack"
        onSubmit={async (event) => {
          event.preventDefault();
          await createPost({
            userId: user.id,
            content,
            imageUrl: imageUrl || undefined,
            tags: tag ? [tag] : ['general']
          });
          setContent('');
          setImageUrl('');
          await loadFeed();
        }}
      >
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share with neighbors" required />
        <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL (optional)" />
        <button type="submit">Create Post</button>
      </form>

      <div className="stack">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onUpvote={async (postId) => {
              await upvotePost(postId);
              await loadFeed();
            }}
          />
        ))}
      </div>
    </section>
  );
}
