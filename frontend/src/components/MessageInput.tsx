import { useState } from 'react';

export function MessageInput({ onSend }: { onSend: (content: string) => Promise<void> }) {
  const [content, setContent] = useState('');

  return (
    <form
      className="row"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!content.trim()) {
          return;
        }
        await onSend(content.trim());
        setContent('');
      }}
    >
      <input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Type message" />
      <button type="submit">Send</button>
    </form>
  );
}
