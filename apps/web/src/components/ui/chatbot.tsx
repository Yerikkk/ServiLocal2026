'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ChevronDown, Bot, User } from 'lucide-react';
import { cn } from '@/lib/cn';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
};

const PREDEFINED_FLOWS: Record<string, { reply: string; nextOptions?: string[] }> = {
  '¿Cómo contrato a un proveedor?': {
    reply: 'Para contratar un proveedor, entra a su perfil y haz clic en "Solicitar servicio". Podrás describir tu problema, elegir la fecha y enviarle la solicitud directamente. Todo el chat se mantendrá seguro en la plataforma.',
    nextOptions: ['¿Es gratis usar ServiLocal?', '¿Cómo funciona la barra de confianza?'],
  },
  '¿Cómo funciona la barra de confianza?': {
    reply: 'La barra de confianza de 0 a 100 indica qué tan seguro y verificado es un proveedor. Aumenta cuando el proveedor valida su identidad, completa trabajos exitosos y recibe buenas reseñas.',
    nextOptions: ['¿Qué pasa si tengo un problema?', '¿Cómo contrato a un proveedor?'],
  },
  '¿Es gratis usar ServiLocal?': {
    reply: '¡Sí! Para los clientes, buscar y contactar proveedores es 100% gratis. Solo pagas por el servicio acordado directamente con el profesional.',
    nextOptions: ['¿Cómo contrato a un proveedor?'],
  },
  '¿Qué pasa si tengo un problema?': {
    reply: 'Si tienes un inconveniente con un servicio, puedes usar el botón "Reportar" en el perfil del proveedor o contactar a soporte@servilocal.com. Nuestro equipo revisará el caso y tomará medidas.',
    nextOptions: ['¿Cómo funciona la barra de confianza?'],
  },
};

const INITIAL_MESSAGE: Message = {
  id: 'init',
  sender: 'bot',
  text: '¡Hola! Soy el asistente de ServiLocal 👋 ¿En qué te puedo ayudar hoy?',
  options: [
    '¿Cómo contrato a un proveedor?',
    '¿Cómo funciona la barra de confianza?',
    '¿Es gratis usar ServiLocal?',
  ]
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when opened first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([INITIAL_MESSAGE]);
      }, 300);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleOptionClick = (option: string) => {
    // 1. Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: option }]);
    
    // 2. Show typing indicator
    setIsTyping(true);

    // 3. Add bot reply after delay
    setTimeout(() => {
      setIsTyping(false);
      const flow = PREDEFINED_FLOWS[option];
      
      if (flow) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: flow.reply,
            options: flow.nextOptions,
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: 'Lo siento, no tengo una respuesta predefinida para eso por ahora. Por favor escríbenos a soporte@servilocal.com.',
            options: ['¿Es gratis usar ServiLocal?', '¿Cómo contrato a un proveedor?'],
          }
        ]);
      }
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sl-primary)] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
        aria-label="Abrir asistente"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          1
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-[550px] md:h-[600px] max-h-[80vh] w-[380px] md:w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] shadow-2xl transition-all duration-300 transform origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[var(--sl-primary)] to-blue-600 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Asistente Virtual</h3>
              <p className="text-[10px] text-white/80">En línea (Automático)</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--sl-bg)]">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full", msg.sender === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                msg.sender === 'user' 
                  ? "bg-[var(--sl-primary)] text-white rounded-tr-sm" 
                  : "bg-[var(--sl-surface)] text-[var(--sl-text-primary)] border border-[var(--sl-border)] rounded-tl-sm"
              )}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[var(--sl-surface)] border border-[var(--sl-border)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Options / Input Area */}
        <div className="border-t border-[var(--sl-border)] bg-[var(--sl-surface)] p-3">
          {messages.length > 0 && messages[messages.length - 1].options && !isTyping ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--sl-text-secondary)] mb-1">Opciones rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(opt)}
                    className="rounded-full border border-[var(--sl-primary)] bg-[var(--sl-primary-muted)] px-3 py-1.5 text-xs font-medium text-[var(--sl-primary)] transition-colors hover:bg-[var(--sl-primary)] hover:text-white text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-center text-[var(--sl-text-secondary)] py-2">
              {isTyping ? 'El asistente está escribiendo...' : 'Selecciona una opción de arriba o reinicia el chat.'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
