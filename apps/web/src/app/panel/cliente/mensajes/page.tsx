import { Metadata } from 'next';
import { ChatListPanel } from '@/components/panel/chat-list-panel';

export const metadata: Metadata = {
  title: 'Mis Mensajes - Cliente | ServiLocal',
};

export default function ClientMessagesPage() {
  return <ChatListPanel role="CLIENT" />;
}
