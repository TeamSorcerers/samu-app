import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonText,
  IonBadge,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonModal,
  IonInput,
  IonTextarea,
  IonActionSheet
} from "@ionic/react";
import { 
  add, 
  search, 
  ellipsisVertical, 
  checkmark, 
  send,
  attach,
  camera,
  archive,
  arrowUndo 
} from 'ionicons/icons';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import './Messages.css';

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  isMine: boolean;
  timestamp: Date;
  imageUrl?: string;
}

interface Contact {
  id: string | number;
  sender: string;
  avatar: string;
  text: string;
  timestamp: Date;
  unread?: boolean;
}

export function Messages() {
  const { messages, addMessage } = useApp();
  const [searchText, setSearchText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<{ [key: string]: ChatMessage[] }>({});
  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [chatInputText, setChatInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedChatImage, setSelectedChatImage] = useState<string | null>(null);
  const [readMessages, setReadMessages] = useState<Set<string | number>>(new Set());
  const [archivedMessages, setArchivedMessages] = useState<Set<string | number>>(new Set());
  const [showArchiveOptions, setShowArchiveOptions] = useState(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const chatModal = useRef<HTMLIonModalElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Carrega dados do localStorage ao montar o componente
  useEffect(() => {
    // LIMPA DADOS ANTIGOS CORRUPTOS (apenas na primeira vez após update)
    const needsReset = localStorage.getItem('chatHistoryVersion');
    if (!needsReset || needsReset !== 'v2') {
      console.log('Limpando histórico antigo...');
      localStorage.removeItem('chatHistory');
      localStorage.setItem('chatHistoryVersion', 'v2');
    }

    const savedReadMessages = localStorage.getItem('readMessages');
    const savedArchivedMessages = localStorage.getItem('archivedMessages');
    const savedChatHistory = localStorage.getItem('chatHistory');

    if (savedReadMessages) {
      setReadMessages(new Set(JSON.parse(savedReadMessages)));
    }

    if (savedArchivedMessages) {
      setArchivedMessages(new Set(JSON.parse(savedArchivedMessages)));
    }

    if (savedChatHistory) {
      console.log('📥 Carregando chatHistory do localStorage...');
      const history = JSON.parse(savedChatHistory);
      console.log('Histórico bruto:', history);
      
      // Converte strings de data de volta para objetos Date
      Object.keys(history).forEach(key => {
        history[key] = history[key].map((msg: ChatMessage) => {
          console.log(`Processando mensagem de ${key}:`, {
            text: msg.text,
            sender: msg.sender,
            isMine: msg.isMine,
            hasImageBefore: !!msg.imageUrl,
            imageLength: msg.imageUrl?.length
          });
          
          const processed = {
            ...msg,
            timestamp: new Date(msg.timestamp),
            // PRESERVA o isMine original - NÃO recalcula!
            isMine: msg.isMine,
            imageUrl: msg.imageUrl // GARANTE que imageUrl é preservado
          };
          
          console.log('Mensagem processada:', {
            text: processed.text,
            sender: processed.sender,
            isMine: processed.isMine,
            hasImageAfter: !!processed.imageUrl,
            imageLength: processed.imageUrl?.length
          });
          
          return processed;
        });
      });
      console.log('Histórico processado:', history);
      setChatHistory(history);
    }
  }, []);

  // Salva readMessages no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('readMessages', JSON.stringify(Array.from(readMessages)));
  }, [readMessages]);

  // Salva archivedMessages no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('archivedMessages', JSON.stringify(Array.from(archivedMessages)));
  }, [archivedMessages]);

  // Salva chatHistory no localStorage quando mudar
  useEffect(() => {
    console.log('💾 Salvando chatHistory...', Object.keys(chatHistory).length, 'conversas');
    try {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      console.log('✅ Salvo com sucesso!');
    } catch (error) {
      console.error('❌ ERRO ao salvar:', error);
    }
  }, [chatHistory]);

  // Filtra mensagens baseado na busca e no segmento selecionado
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.text.toLowerCase().includes(searchText.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchText.toLowerCase());
    
    const isArchived = archivedMessages.has(message.id);
    const isUnread = !readMessages.has(message.id);

    if (selectedSegment === 'all') {
      return matchesSearch && !isArchived;
    } else if (selectedSegment === 'unread') {
      return matchesSearch && isUnread && !isArchived;
    } else if (selectedSegment === 'archived') {
      return matchesSearch && isArchived;
    }
    return matchesSearch;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleSendMessage = () => {
    console.log('=== ENVIANDO MENSAGEM SIMULADA ===');
    console.log('newMessageText:', newMessageText);
    console.log('selectedImage:', selectedImage ? `SIM (${selectedImage.length} bytes)` : 'NÃO');
    console.log('newMessageRecipient:', newMessageRecipient);
    
    if ((newMessageText.trim() || selectedImage) && newMessageRecipient.trim()) {
      const existingMessage = messages.find(m => m.sender === newMessageRecipient.trim());
      
      let recipientId: string;
      let contactKey: string;
      
      if (existingMessage) {
        recipientId = existingMessage.id;
        contactKey = `${recipientId}-${newMessageRecipient.trim()}`;
        console.log('Conversa existente encontrada');
      } else {
        recipientId = `contact-${Date.now()}`;
        contactKey = `${recipientId}-${newMessageRecipient.trim()}`;
        console.log('Nova conversa criada');
        
        addMessage({
          text: newMessageText.trim() || '📷 Imagem',
          sender: newMessageRecipient.trim(),
          avatar: 'https://picsum.photos/40/40?random=' + Math.floor(Math.random() * 100)
        });
      }

      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        text: newMessageText.trim() || '',
        sender: newMessageRecipient.trim(),
        isMine: false,
        timestamp: new Date(),
        imageUrl: selectedImage || undefined
      };

      console.log('Mensagem criada:', {
        id: newMsg.id,
        text: newMsg.text,
        hasImage: !!newMsg.imageUrl,
        imageLength: newMsg.imageUrl?.length
      });

      setChatHistory(prev => {
        const updated = {
          ...prev,
          [contactKey]: [...(prev[contactKey] || []), newMsg]
        };
        console.log('Histórico atualizado. Total de mensagens:', updated[contactKey].length);
        return updated;
      });

      setNewMessageText('');
      setNewMessageRecipient('');
      setSelectedImage(null);
      setIsNewChatOpen(false);
    }
  };

  const compressImage = (base64: string, maxWidth: number = 600): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        console.log('🔧 Compressão:', base64.length, '→', compressed.length);
        resolve(compressed);
      };
      img.src = base64;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const compressed = await compressImage(result);
        setSelectedImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChatFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const compressed = await compressImage(result);
        setSelectedChatImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenChat = (message: Contact) => {
    setSelectedContact(message);
    setReadMessages(prev => new Set(prev).add(message.id));
    
    const contactKey = `${message.id}-${message.sender}`;
    const savedHistory = chatHistory[contactKey];
    
    console.log('=== ABRINDO CHAT ===');
    console.log('ContactKey:', contactKey);
    console.log('SavedHistory:', savedHistory);
    
    if (savedHistory && savedHistory.length > 0) {
      console.log('Carregando', savedHistory.length, 'mensagens do histórico');
      savedHistory.forEach((msg, i) => {
        console.log(`Mensagem ${i + 1}:`, {
          text: msg.text,
          sender: msg.sender,
          isMine: msg.isMine,
          hasImage: !!msg.imageUrl,
          imageLength: msg.imageUrl?.length
        });
      });
      setChatMessages(savedHistory);
    } else {
      console.log('Sem histórico salvo - criando mensagens de exemplo');
      // Se não tem histórico, cria mensagens iniciais de exemplo
      const initialMessages = [
        // {
        //   id: '1',
        //   text: 'Oi! Tudo bem?',
        //   sender: message.sender,
        //   isMine: false,
        //   timestamp: new Date(Date.now() - 3600000)
        // },
        // {
        //   id: '2',
        //   text: 'Tudo ótimo! E você?',
        //   sender: 'Você',
        //   isMine: true,
        //   timestamp: new Date(Date.now() - 3500000)
        // },
        {
          id: '3',
          text: message.text,
          sender: message.sender,
          isMine: false,
          timestamp: message.timestamp
        }
      ];
      setChatMessages(initialMessages);
    }
    
    setIsChatOpen(true);
  };

  const handleSendChatMessage = () => {
    console.log('=== ENVIANDO MENSAGEM NO CHAT ===');
    console.log('chatInputText:', chatInputText);
    console.log('selectedChatImage:', selectedChatImage ? 'IMAGEM PRESENTE' : 'SEM IMAGEM');
    console.log('selectedContact:', selectedContact);
    
    if ((chatInputText.trim() || selectedChatImage) && selectedContact) {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        text: chatInputText.trim() || '',
        sender: 'Você',
        isMine: true,
        timestamp: new Date(),
        imageUrl: selectedChatImage || undefined
      };
      
      console.log('Nova mensagem criada:', newMsg);
      console.log('imageUrl na mensagem:', newMsg.imageUrl ? 'PRESENTE' : 'AUSENTE');
      
      const updatedMessages = [...chatMessages, newMsg];
      setChatMessages(updatedMessages);
      
      // Salva no histórico
      const contactKey = `${selectedContact.id}-${selectedContact.sender}`;
      setChatHistory(prev => ({
        ...prev,
        [contactKey]: updatedMessages
      }));
      
      console.log('Mensagens atualizadas:', updatedMessages);
      
      setChatInputText('');
      setSelectedChatImage(null);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedContact(null);
    setChatMessages([]);
    setChatInputText('');
    setSelectedChatImage(null);
    setShowArchiveOptions(false);
  };

  const handleArchiveChat = () => {
    if (selectedContact) {
      setArchivedMessages(prev => new Set(prev).add(selectedContact.id));
      setShowArchiveOptions(false);
      handleCloseChat();
    }
  };

  const handleUnarchiveChat = () => {
    if (selectedContact) {
      setArchivedMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedContact.id);
        return newSet;
      });
      setShowArchiveOptions(false);
    }
  };

  const conversationGroups = [
    {
      title: 'Criadores',
      messages: filteredMessages.filter(m => ['Ana Silva', 'João Santos'].includes(m.sender))
    },
    {
      title: 'Seguidores',
      messages: filteredMessages.filter(m => !['Ana Silva', 'João Santos'].includes(m.sender))
    }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mensagens</IonTitle>
          <IonButton slot="end" fill="clear">
            <IonIcon icon={ellipsisVertical} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Mensagens</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div className="messages-header">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Pesquisar conversas..."
            showClearButton="focus"
          />
          
          <IonSegment
            value={selectedSegment}
            onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
          >
            <IonSegmentButton value="all">
              <IonLabel>Todas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="unread">
              <IonLabel>Não lidas</IonLabel>
              {messages.filter(m => !readMessages.has(m.id) && !archivedMessages.has(m.id)).length > 0 && (
                <IonBadge color="danger">
                  {messages.filter(m => !readMessages.has(m.id) && !archivedMessages.has(m.id)).length}
                </IonBadge>
              )}
            </IonSegmentButton>
            <IonSegmentButton value="archived">
              <IonLabel>Arquivadas</IonLabel>
              {archivedMessages.size > 0 && (
                <IonBadge color="medium">{archivedMessages.size}</IonBadge>
              )}
            </IonSegmentButton>
          </IonSegment>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="empty-messages">
            <IonCard>
              <IonCardContent className="empty-content">
                <IonIcon icon={search} size="large" color="medium" />
                <IonText color="medium">
                  <h2>Nenhuma conversa encontrada</h2>
                  <p>Inicie uma nova conversa tocando no botão +</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <IonList>
            {conversationGroups.map((group, index) => (
              <div key={index}>
                {group.messages.length > 0 && (
                  <>
                    <IonItem lines="none" className="group-header">
                      <IonLabel>
                        <IonText color="medium">
                          <h3>{group.title}</h3>
                        </IonText>
                      </IonLabel>
                    </IonItem>
                    {group.messages.map((message) => (
                      <IonItem 
                        key={message.id} 
                        button 
                        className="message-item"
                        onClick={() => handleOpenChat(message)}
                      >
                        <IonAvatar slot="start">
                          <img src={message.avatar} alt={message.sender} />
                        </IonAvatar>
                        <IonLabel>
                          <div className="message-header">
                            <h2 className="sender-name">{message.sender}</h2>
                            <div className="message-time">
                              <IonText color="medium">{formatTime(message.timestamp)}</IonText>
                            </div>
                          </div>
                          <div className="message-preview">
                            <IonText color="medium">
                              <p>{message.text}</p>
                            </IonText>
                            <div className="message-status">
                              <IonIcon icon={checkmark} color="primary" />
                            </div>
                          </div>
                        </IonLabel>
                        {!readMessages.has(message.id) && (
                          <IonBadge color="danger" className="unread-badge">1</IonBadge>
                        )}
                      </IonItem>
                    ))}
                  </>
                )}
              </div>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton 
            className="play-button"
            onClick={() => setIsNewChatOpen(true)}
          >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modal Nova Mensagem */}
        <IonModal ref={modal} isOpen={isNewChatOpen} onDidDismiss={() => {
          setIsNewChatOpen(false);
          setNewMessageText('');
          setNewMessageRecipient('');
          setSelectedImage(null);
        }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Simular Mensagem Recebida</IonTitle>
              <IonButton 
                slot="end" 
                fill="clear"
                onClick={() => {
                  setIsNewChatOpen(false);
                  setNewMessageText('');
                  setNewMessageRecipient('');
                  setSelectedImage(null);
                }}
              >
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="new-message-form">
              <IonItem>
                <IonLabel position="stacked">De (quem enviou)</IonLabel>
                <IonInput 
                  placeholder="Digite o nome de quem enviou"
                  value={newMessageRecipient}
                  onIonInput={(e) => setNewMessageRecipient(e.detail.value!)}
                />
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Mensagem</IonLabel>
                <IonTextarea
                  value={newMessageText}
                  onIonInput={(e) => setNewMessageText(e.detail.value!)}
                  placeholder="Digite sua mensagem..."
                  rows={4}
                />
              </IonItem>

              {selectedImage && (
                <div className="image-preview-container">
                  <img src={selectedImage} alt="Preview" className="image-preview" />
                  <IonButton 
                    fill="clear" 
                    size="small"
                    onClick={() => setSelectedImage(null)}
                  >
                    Remover
                  </IonButton>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              <div className="message-actions">
                <IonButton 
                  fill="clear"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IonIcon icon={attach} slot="start" />
                  Anexar
                </IonButton>
                <IonButton 
                  fill="clear"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IonIcon icon={camera} slot="start" />
                  Foto
                </IonButton>
              </div>

              <IonButton 
                expand="block"
                color="primary"
                onClick={handleSendMessage}
                disabled={(!newMessageText.trim() && !selectedImage) || !newMessageRecipient.trim()}
              >
                <IonIcon icon={send} slot="start" />
                Enviar Mensagem
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Modal Chat Individual */}
        <IonModal 
          ref={chatModal} 
          isOpen={isChatOpen} 
          onDidDismiss={handleCloseChat}
        >
          <IonHeader>
            <IonToolbar>
              <IonButton 
                slot="start" 
                fill="clear"
                onClick={handleCloseChat}
              >
                Voltar
              </IonButton>
              <IonTitle>
                {selectedContact?.sender}
              </IonTitle>
              <IonButton 
                slot="end" 
                fill="clear"
                onClick={() => setShowArchiveOptions(true)}
              >
                <IonIcon icon={ellipsisVertical} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="chat-content">
            <div className="chat-messages">
              {chatMessages.map((msg) => {
                console.log('Renderizando mensagem:', msg.id, '| text:', msg.text, '| imageUrl:', msg.imageUrl ? 'PRESENTE' : 'AUSENTE');
                return (
                  <div 
                    key={msg.id} 
                    className={`chat-message ${msg.isMine ? 'mine' : 'theirs'}`}
                  >
                    {!msg.isMine && (
                      <IonAvatar className="chat-avatar">
                        <img src={selectedContact?.avatar} alt={msg.sender} />
                      </IonAvatar>
                    )}
                    <div className="message-bubble">
                      {msg.imageUrl && (
                        <>
                          <img src={msg.imageUrl} alt="Imagem enviada" className="chat-sent-image" />
                          {console.log('Renderizando imagem:', msg.imageUrl.substring(0, 50))}
                        </>
                      )}
                      {msg.text && <p>{msg.text}</p>}
                      <span className="message-timestamp">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </IonContent>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={chatFileInputRef}
            style={{ display: 'none' }}
            onChange={handleChatFileSelect}
          />

          {selectedChatImage && (
            <div className="chat-image-preview">
              <img src={selectedChatImage} alt="Preview" />
              <IonButton 
                fill="clear" 
                size="small"
                onClick={() => setSelectedChatImage(null)}
              >
                Remover
              </IonButton>
            </div>
          )}

          <div className="chat-input-container">
            <IonButton 
              fill="clear" 
              className="chat-action-btn"
              onClick={() => chatFileInputRef.current?.click()}
            >
              <IonIcon icon={camera} />
            </IonButton>
            <IonTextarea
              value={chatInputText}
              onIonInput={(e) => setChatInputText(e.detail.value!)}
              placeholder="Digite uma mensagem..."
              autoGrow={true}
              rows={1}
              className="chat-input"
            />
            <IonButton 
              fill="clear" 
              className="chat-send-btn"
              onClick={handleSendChatMessage}
              disabled={!chatInputText.trim() && !selectedChatImage}
            >
              <IonIcon icon={send} color={(chatInputText.trim() || selectedChatImage) ? 'primary' : 'medium'} />
            </IonButton>
          </div>
        </IonModal>

        {/* ActionSheet para opções de arquivar */}
        <IonActionSheet
          isOpen={showArchiveOptions}
          onDidDismiss={() => setShowArchiveOptions(false)}
          header="Opções da Conversa"
          buttons={[
            {
              text: selectedContact && archivedMessages.has(selectedContact.id) ? 'Desarquivar Conversa' : 'Arquivar Conversa',
              icon: selectedContact && archivedMessages.has(selectedContact.id) ? arrowUndo : archive,
              handler: () => {
                if (selectedContact && archivedMessages.has(selectedContact.id)) {
                  handleUnarchiveChat();
                } else {
                  handleArchiveChat();
                }
              }
            },
            {
              text: 'Cancelar',
              role: 'cancel',
              data: {
                action: 'cancel',
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  )
}