import { Metadata } from 'next';
import { ChatListPanel } from '@/components/panel/chat-list-panel';

export const metadata: Metadata = {
  title: 'Mis Mensajes - Proveedor | ServiLocal',
};

export default function ProviderMessagesPage() {
  return <ChatListPanel role="PROVIDER" />;
}
