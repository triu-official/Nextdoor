import { useEffect, useState } from 'react';
import type { CircleChannel, CircleMessage, Society } from '../../../shared/src/models';
import { createChannel, createMessage, createSociety, joinSociety, listChannels, listJoinedSocieties, listMessages, listSocieties } from '../api/circlesApi';
import { MessageInput } from '../components/MessageInput';
import { MessageList } from '../components/MessageList';
import { useUserContext } from '../context/UserContext';

export function CommunityCirclesPage() {
  const { user } = useUserContext();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [channels, setChannels] = useState<CircleChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<CircleChannel | null>(null);
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [accessCode, setAccessCode] = useState('');
  const [newSocietyName, setNewSocietyName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');

  async function loadSocieties(): Promise<void> {
    if (!user) {
      return;
    }
    const joined = await listJoinedSocieties(user.id);
    if (joined.items.length > 0) {
      setSocieties(joined.items);
      return;
    }
    const available = await listSocieties(user.city, user.locality);
    setSocieties(available.items);
  }

  async function loadChannels(societyId: string): Promise<void> {
    const response = await listChannels(societyId);
    setChannels(response.items);
  }

  async function loadMessages(channelId: string): Promise<void> {
    const response = await listMessages(channelId);
    setMessages(response.items);
  }

  useEffect(() => {
    void loadSocieties();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedChannel) {
      return;
    }
    void loadMessages(selectedChannel.id);
    const interval = setInterval(() => {
      void loadMessages(selectedChannel.id);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedChannel?.id]);

  if (!user) {
    return <div className="screen">Please complete onboarding.</div>;
  }

  return (
    <section className="screen">
      <h2>Community Circles</h2>

      <div className="card stack">
        <h3>Create society</h3>
        <input value={newSocietyName} onChange={(event) => setNewSocietyName(event.target.value)} placeholder="Society name" />
        <input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="Access code" />
        <button
          onClick={async () => {
            const created = await createSociety({
              name: newSocietyName,
              city: user.city,
              locality: user.locality,
              accessCode
            });
            await joinSociety(created.society.id, { userId: user.id, accessCode });
            setAccessCode('');
            setNewSocietyName('');
            await loadSocieties();
          }}
        >
          Create + Join
        </button>
      </div>

      <div className="stack">
        {societies.map((society) => (
          <article key={society.id} className="card">
            <h3>{society.name}</h3>
            <p>{society.locality}, {society.city}</p>
            <div className="row">
              <button
                onClick={async () => {
                  setSelectedSociety(society);
                  await loadChannels(society.id);
                }}
              >
                Open
              </button>
              <button
                onClick={async () => {
                  await joinSociety(society.id, { userId: user.id, accessCode });
                  await loadSocieties();
                }}
              >
                Join with code
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedSociety ? (
        <div className="card stack">
          <h3>Channels in {selectedSociety.name}</h3>
          <div className="row">
            <input value={newChannelName} onChange={(event) => setNewChannelName(event.target.value)} placeholder="Channel name" />
            <button
              onClick={async () => {
                await createChannel({ societyId: selectedSociety.id, name: newChannelName });
                setNewChannelName('');
                await loadChannels(selectedSociety.id);
              }}
            >
              Add
            </button>
          </div>
          <div className="row wrap">
            {channels.map((channel) => (
              <button key={channel.id} className={selectedChannel?.id === channel.id ? 'chip active' : 'chip'} onClick={() => setSelectedChannel(channel)}>
                {channel.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedChannel ? (
        <div className="card stack">
          <h3>{selectedChannel.name}</h3>
          <MessageList messages={messages} currentUserId={user.id} />
          <MessageInput
            onSend={async (content) => {
              await createMessage(selectedChannel.id, { userId: user.id, content });
              await loadMessages(selectedChannel.id);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
