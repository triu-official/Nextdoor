import { Link } from 'react-router-dom';
import type { FeedPost } from '../api/feedApi';

export function PostCard({ post, onUpvote }: { post: FeedPost; onUpvote: (postId: string) => void }) {
  return (
    <article className="card">
      <div className="meta">{post.authorName ?? 'Neighbor'} • {post.locality}, {post.city}</div>
      <h3>{post.content}</h3>
      {post.imageUrl ? <img src={post.imageUrl} alt="Post" className="thumb" /> : null}
      {post.tags?.length ? <div className="chips">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
      <div className="row between">
        <button onClick={() => onUpvote(post.id)}>▲ {post.upvotes}</button>
        <Link to={`/feed/${post.id}`}>Comments ({post.commentsCount})</Link>
      </div>
    </article>
  );
}
