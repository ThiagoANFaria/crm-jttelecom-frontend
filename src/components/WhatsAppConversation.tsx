import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { smartbotService } from "@/services/smartbotService";
import { 
  WhatsAppMessage, 
  WhatsAppConversation as ConversationType,
  MessageType,
  MessageDirection,
  SenderType,
  SendMessagePayload 
} from "@/types/chatbot";
import { 
  Send, 
  Phone, 
  MoreVertical, 
  Download, 
  Tag,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Image,
  FileText,
  Video,
  Mic,
  MapPin,
  User,
  Bot,
  UserCheck,
  Settings
} from "lucide-react";

interface WhatsAppConversationProps {
  leadId: string;
  whatsappNumber: string;
  contactName?: string;
  onClose?: () => void;
}

const WhatsAppConversation: React.FC<WhatsAppConversationProps> = ({
  leadId,
  whatsappNumber,
  contactName,
  onClose
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [conversation, setConversation] = useState<ConversationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentTenant && whatsappNumber) {
      loadConversation();
      loadMessages();
    }
  }, [currentTenant, whatsappNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    if (!currentTenant) return;

    try {
      const conv = await smartbotService.getConversationByWhatsApp(currentTenant.id, whatsappNumber);
      setConversation(conv);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentTenant) return;

    setIsLoading(true);
    try {
      const result = await smartbotService.getMessagesByWhatsApp(currentTenant.id, whatsappNumber, {
        page: 1,
        limit: 100
      });
      setMessages(result.messages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTenant || isSending) return;

    setIsSending(true);
    try {
      const payload: SendMessagePayload = {
        whatsappNumber,
        content: newMessage.trim(),
        messageType: MessageType.TEXT
      };

      const result = await smartbotService.sendMessage(currentTenant.id, payload);
      
      if (result.success) {
        setNewMessage('');
        // Recarregar mensagens para mostrar a nova mensagem
        await loadMessages();
        toast({
          title: "Sucesso",
          description: "Mensagem enviada com sucesso",
        });
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: Date) => {
    return smartbotService.formatMessageTimestamp(timestamp);
  };

  const getMessageIcon = (messageType: MessageType) => {
    switch (messageType) {
      case MessageType.IMAGE:
        return <Image className="w-3 h-3" />;
      case MessageType.VIDEO:
        return <Video className="w-3 h-3" />;
      case MessageType.AUDIO:
        return <Mic className="w-3 h-3" />;
      case MessageType.DOCUMENT:
        return <FileText className="w-3 h-3" />;
      case MessageType.LOCATION:
        return <MapPin className="w-3 h-3" />;
      case MessageType.CONTACT:
        return <User className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getSenderIcon = (senderType: SenderType) => {
    switch (senderType) {
      case SenderType.BOT:
        return <Bot className="w-3 h-3 text-blue-500" />;
      case SenderType.HUMAN:
        return <UserCheck className="w-3 h-3 text-green-500" />;
      case SenderType.SYSTEM:
        return <Settings className="w-3 h-3 text-gray-500" />;
      default:
        return <User className="w-3 h-3 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const MessageBubble: React.FC<{ message: WhatsAppMessage }> = ({ message }) => {
    const isOutbound = message.direction === MessageDirection.OUTBOUND;
    const bubbleClass = isOutbound
      ? 'bg-green-500 text-white ml-auto'
      : 'bg-white border mr-auto';

    return (
      <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${bubbleClass}`}>
          {/* Header da mensagem */}
          <div className="flex items-center gap-1 mb-1">
            {getSenderIcon(message.senderType)}
            <span className={`text-xs font-medium ${isOutbound ? 'text-green-100' : 'text-gray-600'}`}>
              {message.senderName || (message.senderType === SenderType.CLIENT ? contactName : 'Sistema')}
            </span>
            {getMessageIcon(message.messageType)}
          </div>

          {/* Conteúdo da mensagem */}
          <div className="text-sm">
            {message.messageType === MessageType.TEXT ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="flex items-center gap-2">
                {getMessageIcon(message.messageType)}
                <span className="italic">
                  {message.messageType === MessageType.IMAGE && 'Imagem'}
                  {message.messageType === MessageType.VIDEO && 'Vídeo'}
                  {message.messageType === MessageType.AUDIO && 'Áudio'}
                  {message.messageType === MessageType.DOCUMENT && 'Documento'}
                  {message.messageType === MessageType.LOCATION && 'Localização'}
                  {message.messageType === MessageType.CONTACT && 'Contato'}
                </span>
              </div>
            )}
          </div>

          {/* Footer da mensagem */}
          <div className={`flex items-center justify-between mt-1 text-xs ${isOutbound ? 'text-green-100' : 'text-gray-500'}`}>
            <span>{formatTimestamp(message.timestamp)}</span>
            {isOutbound && (
              <div className="flex items-center gap-1">
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Carregando conversa...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      {/* Header da conversa */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-green-100 text-green-700">
                {contactName ? contactName.charAt(0).toUpperCase() : 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {contactName || 'Contato WhatsApp'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {smartbotService.formatWhatsAppNumber(whatsappNumber)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {conversation && (
              <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'}>
                {conversation.status === 'open' ? 'Ativo' : 'Inativo'}
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Área de mensagens */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Nenhuma mensagem encontrada</p>
              <p className="text-sm text-gray-400">
                Inicie uma conversa enviando uma mensagem
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-2">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg mr-auto">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Campo de envio */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Ações adicionais */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-gray-700">
              <Download className="w-3 h-3" />
              Exportar
            </button>
            <button className="flex items-center gap-1 hover:text-gray-700">
              <Tag className="w-3 h-3" />
              Tags
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {conversation?.unreadCount && conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {conversation.unreadCount} não lidas
              </Badge>
            )}
            <span>
              {messages.length} mensagem{messages.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WhatsAppConversation;

