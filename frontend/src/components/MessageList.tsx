import type { CircleMessage } from '../../../shared/src/models';

export function MessageList({ messages, currentUserId }: { messages: CircleMessage[]; currentUserId: string }) {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className={message.userId === currentUserId ? 'bubble mine' : 'bubble'}>
          <p>{message.content}</p>
          <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
        </div>
      ))}
    </div>
  );
}
