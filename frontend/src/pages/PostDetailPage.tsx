import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Comment } from '../../../shared/src/models';
import { addComment, getComments } from '../api/feedApi';
import { useUserContext } from '../context/UserContext';

export function PostDetailPage() {
  const { postId = '' } = useParams();
  const { user } = useUserContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');

  async function loadComments(): Promise<void> {
    const response = await getComments(postId);
    setComments(response.items);
  }

  useEffect(() => {
    void loadComments();
  }, [postId]);

  if (!user) {
    return <div className="screen">Please complete onboarding.</div>;
  }

  return (
    <section className="screen">
      <h2>Comments</h2>
      <form
        className="row"
        onSubmit={async (event) => {
          event.preventDefault();
          await addComment(postId, { userId: user.id, content });
          setContent('');
          await loadComments();
        }}
      >
        <input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Add comment" required />
        <button type="submit">Send</button>
      </form>
      <div className="stack">
        {comments.map((comment) => (
          <article key={comment.id} className="card">
            <p>{comment.content}</p>
            <small>{new Date(comment.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
