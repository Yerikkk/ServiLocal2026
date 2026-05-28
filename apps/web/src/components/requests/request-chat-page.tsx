'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  CheckCheck, 
  MoreVertical, 
  ShieldCheck, 
  Paperclip, 
  Image as ImageIcon, 
  FileText,
  X,
  User as UserIcon,
  MapPin,
  Star as StarIcon,
  Info,
  ExternalLink,
  Shield,
  Calendar
} from 'lucide-react';
import { translateStatus } from '@/lib/translations';
import { api, type ApiError } from '@/lib/api-client';

type Role = 'CLIENT' | 'PROVIDER';

type CurrentUser = {
  id: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

type ChatItem = {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  sender: {
    id: string;
    fullName: string;
    role: Role;
  };
};

type ChatResponse = {
  request: {
    id: string;
    serviceTitle: string;
    status: string;
    client: {
      id: string;
      fullName: string;
    };
    provider: {
      id: string;
      fullName: string;
      businessName: string;
    };
  };
  items: ChatItem[];
};

function getRolePath(role: CurrentUser['role']) {
  if (role === 'ADMIN') return '/panel/admin';
  if (role === 'PROVIDER') return '/panel/proveedor';
  return '/panel/cliente';
}

export function RequestChatPage({
  role,
  backHref,
}: {
  role: Role;
  backHref: string;
}) {
  const params = useParams<{ requestId: string }>();
  const router = useRouter();
  const requestId = params?.requestId;

  const [chat, setChat] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isClosedRequest = useMemo(() => {
    const status = chat?.request.status;
    return status === 'CANCELLED' || status === 'COMPLETED' || status === 'EXPIRED';
  }, [chat?.request.status]);

  const loadChat = useCallback(async () => {
    if (!requestId) return;

    const data = await api.get<ChatResponse>(`/api/request-messages/request/${requestId}`);
    setChat(data);
  }, [requestId]);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Archivo seleccionado: ${file.name}\n(La subida de archivos se implementará en la siguiente fase)`);
    }
  };

  const handleMoreOptions = () => {
    alert("Opciones adicionales: Ver detalles de la solicitud, Reportar usuario, Silenciar notificaciones.");
  };

  const loadPublicProfile = async () => {
    if (!chat) return;
    const otherId = role === 'CLIENT' ? chat.request.provider.id : chat.request.client.id;
    
    try {
      setLoadingProfile(true);
      setShowPublicProfile(true);
      const data = await api.get<any>(`/api/users/${otherId}/public-profile`);
      setPublicProfile(data);
    } catch (err) {
      console.error('Error loading public profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    let intervalId: number | undefined;

    async function initialize() {
      try {
        setLoading(true);
        setError('');

        const currentUser = await api.get<CurrentUser>('/api/auth/me');
        if (currentUser.role !== role) {
          router.replace(getRolePath(currentUser.role));
          return;
        }

        await loadChat();

        intervalId = window.setInterval(() => {
          if (!ignore) {
            loadChat().catch(() => null);
          }
        }, 4000);
      } catch (err: any) {
        if (err?.status === 401) return;
        if (!ignore) {
          setError(err?.message ?? 'No se pudo cargar el chat');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      ignore = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [loadChat, role, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || !requestId) return;

    try {
      setSending(true);
      setError('');

      await api.post(`/api/request-messages/request/${requestId}`, {
        content: message.trim(),
      });

      setMessage('');
      await loadChat();
    } catch (err: any) {
      if (err?.status === 401) return;
      setError(err?.message ?? 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.items]);

  if (loading && !chat) {
    return (
      <main className="flex h-screen items-center justify-center bg-[var(--sl-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--sl-primary)] border-t-transparent"></div>
          <p className="text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>Cargando chat...</p>
        </div>
      </main>
    );
  }

  const otherPartyName = role === 'CLIENT' ? chat?.request.provider.businessName || chat?.request.provider.fullName : chat?.request.client.fullName;

  return (
    <main className="flex h-screen flex-col bg-[var(--sl-bg)]">
      {/* Modern Header */}
      <header className="flex h-[76px] shrink-0 items-center justify-between px-5 md:px-8 bg-[var(--sl-surface)] border-b border-[var(--sl-border)] shadow-sm z-10 sl-glass">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sl-bg)] hover:bg-[var(--sl-border)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: 'var(--sl-text-primary)' }} />
          </Link>
          
          <div 
            onClick={loadPublicProfile}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)] font-bold text-lg shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
              {publicProfile?.avatarUrl ? (
                <img src={publicProfile.avatarUrl} alt={otherPartyName ?? 'U'} className="w-full h-full object-cover" />
              ) : (
                otherPartyName?.charAt(0).toUpperCase() ?? 'U'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight group-hover:text-[var(--sl-primary)] transition-colors" style={{ color: 'var(--sl-text-primary)' }}>
                {otherPartyName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--sl-primary)' }}>
                  {chat?.request.serviceTitle || 'En línea'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] font-bold">
                  {translateStatus(chat?.request.status ?? 'PENDING')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" /> Pago seguro
            </span>
            <button 
              onClick={handleMoreOptions}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--sl-text-secondary)] hover:bg-[var(--sl-border)] hover:text-[var(--sl-primary)] transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
      </header>

      {/* Error banner if any */}
      {error && (
        <div className="bg-red-50 text-red-600 text-center text-sm font-medium py-3 px-4 border-b border-red-100 z-20 flex justify-center items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Chat Messages Area */}
      <section 
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6"
      >
        {chat?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <div className="h-16 w-16 mb-4 rounded-2xl bg-[var(--sl-primary-muted)] flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-[var(--sl-primary)]" />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
              El inicio de una gran conexión.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--sl-text-muted)' }}>
              Tus mensajes están protegidos por ServiLocal.
            </p>
          </div>
        ) : (
          chat?.items.map((item, index) => {
            const isMine = item.isMine;
            const showAvatar = index === 0 || chat.items[index - 1].isMine !== isMine;
            
            return (
              <div key={item.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] sm:max-w-[70%] items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar Space */}
                  <div className="shrink-0 w-8 flex justify-center">
                    {!isMine && showAvatar && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sl-border)] text-xs font-bold text-[var(--sl-text-secondary)]">
                        {item.sender.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div 
                    className={`relative px-5 py-3.5 shadow-sm sl-animate-fade-in-up ${
                      isMine 
                        ? 'bg-[var(--sl-primary)] text-white rounded-[24px] rounded-br-sm' 
                        : 'bg-[var(--sl-surface)] border border-[var(--sl-border)] text-[var(--sl-text-primary)] rounded-[24px] rounded-bl-sm'
                    }`}
                  >
                    {!isMine && showAvatar && (
                      <div className="text-[12px] font-bold text-[var(--sl-primary)] mb-1">
                        {item.sender.fullName}
                      </div>
                    )}
                    
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {item.content}
                    </div>
                    
                    <div className={`flex items-center gap-1.5 mt-1.5 justify-end ${isMine ? 'text-white/80' : 'text-[var(--sl-text-muted)]'}`}>
                      <span className="text-[10px] font-medium tracking-wide">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && (
                        <CheckCheck className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* Innovative Input Area */}
      <div className="bg-[var(--sl-surface)] border-t border-[var(--sl-border)] p-4 sm:px-8 sm:py-5 shrink-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3 max-w-5xl mx-auto"
        >
          {/* Hidden File Inputs */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={imageInputRef} 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1 mb-1 bg-[var(--sl-bg)] rounded-xl p-1 border border-[var(--sl-border)]">
            <button 
              type="button" 
              onClick={handleAttachClick}
              className="p-2 rounded-lg hover:bg-[var(--sl-border-light)] transition-colors text-[var(--sl-text-secondary)] hover:text-[var(--sl-primary)]" 
              title="Adjuntar archivo"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button 
              type="button" 
              onClick={handleImageClick}
              className="p-2 rounded-lg hover:bg-[var(--sl-border-light)] transition-colors text-[var(--sl-text-secondary)] hover:text-[var(--sl-primary)]" 
              title="Enviar imagen"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Text Input */}
          <div className="relative flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                }
              }}
              disabled={sending || isClosedRequest}
              placeholder={
                isClosedRequest
                  ? 'La conversación está cerrada'
                  : 'Escribe tu mensaje aquí...'
              }
              rows={1}
              style={{ minHeight: '52px', maxHeight: '120px' }}
              className="w-full resize-none rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] pl-5 pr-4 py-3.5 text-[15px] text-[var(--sl-text-primary)] outline-none placeholder:text-[var(--sl-text-muted)] focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all disabled:opacity-70 disabled:bg-[var(--sl-border-light)]"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={sending || !message.trim() || isClosedRequest}
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-primary)] hover:bg-[var(--sl-primary-hover)] transition-all text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-[1.02] active:scale-95"
          >
            <Send className="h-5 w-5 translate-x-[-1px] translate-y-[1px]" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[11px] font-medium text-[var(--sl-text-muted)]">
            Presiona <strong>Enter</strong> para enviar, <strong>Shift + Enter</strong> para nueva línea
          </span>
        </div>
      </div>
      {/* Public Profile Drawer */}
      {showPublicProfile && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] sl-animate-fade-in"
            onClick={() => setShowPublicProfile(false)}
          />
          <aside className="relative w-full max-w-md h-full bg-[var(--sl-surface)] shadow-2xl sl-animate-slide-right flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h3 className="text-xl font-bold" style={{ color: 'var(--sl-text-primary)' }}>Perfil del {publicProfile?.role === 'PROVIDER' ? 'Proveedor' : 'Cliente'}</h3>
              <button 
                onClick={() => setShowPublicProfile(false)}
                className="p-2 rounded-xl hover:bg-[var(--sl-bg)] transition-colors"
                style={{ color: 'var(--sl-text-secondary)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  <div className="w-10 h-10 border-4 border-[var(--sl-primary)] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>Cargando perfil...</p>
                </div>
              ) : publicProfile ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-[32px] overflow-hidden bg-[var(--sl-primary-muted)] border-4 border-[var(--sl-surface)] shadow-xl mx-auto flex items-center justify-center">
                        {publicProfile.avatarUrl ? (
                          <img src={publicProfile.avatarUrl} alt={publicProfile.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-16 h-16 text-[var(--sl-primary)]" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-[var(--sl-surface)] shadow-lg">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                    </div>
                    <h4 className="mt-6 text-2xl font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>{publicProfile.fullName}</h4>
                    <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--sl-primary)' }}>{publicProfile.role}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="sl-card p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sl-text-muted)' }}>Confianza</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <Shield className="h-4 w-4 text-[var(--sl-success)]" />
                        <span className="text-lg font-bold text-[var(--sl-success)]">{publicProfile.trustScore}%</span>
                      </div>
                    </div>
                    <div className="sl-card p-4 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sl-text-muted)' }}>Miembro</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[var(--sl-primary)]" />
                        <span className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>
                          {new Date(publicProfile.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--sl-text-secondary)' }}>
                        <Info className="h-3.5 w-3.5" /> Sobre {publicProfile.role === 'PROVIDER' ? 'el proveedor' : 'el cliente'}
                      </h5>
                      <p className="text-sm leading-relaxed p-4 rounded-2xl bg-[var(--sl-bg)] border border-[var(--sl-border)] italic" style={{ color: 'var(--sl-text-primary)' }}>
                        {publicProfile.bio || 'Este usuario aún no ha agregado una biografía.'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-[var(--sl-primary)] text-white font-bold shadow-lg hover:bg-[var(--sl-primary-hover)] transition-all">
                        Ver Perfil Completo
                      </button>
                      <button 
                        onClick={() => setShowPublicProfile(false)}
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl border border-[var(--sl-border)] font-bold transition-all hover:bg-[var(--sl-bg)]"
                        style={{ color: 'var(--sl-text-primary)' }}
                      >
                        Cerrar Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <p style={{ color: 'var(--sl-text-secondary)' }}>No se pudo cargar la información del perfil.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
