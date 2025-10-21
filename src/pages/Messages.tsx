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
  IonTextarea
} from "@ionic/react";
import { 
  add, 
  search, 
  ellipsisVertical, 
  checkmark, 
  send,
  attach,
  camera 
} from 'ionicons/icons';
import { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import './Messages.css';

export function Messages() {
  const { messages, addMessage } = useApp();
  const [searchText, setSearchText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const modal = useRef<HTMLIonModalElement>(null);

  const filteredMessages = messages.filter(message => 
    message.text.toLowerCase().includes(searchText.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchText.toLowerCase())
  );

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
    if (newMessageText.trim()) {
      addMessage({
        text: newMessageText.trim(),
        sender: 'Você',
        avatar: 'https://picsum.photos/40/40?random=99'
      });
      setNewMessageText('');
    }
  };

  const conversationGroups = [
    {
      title: 'Criadores',
      messages: messages.filter(m => ['Ana Silva', 'João Santos'].includes(m.sender))
    },
    {
      title: 'Seguidores',
      messages: messages.filter(m => !['Ana Silva', 'João Santos'].includes(m.sender))
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
              <IonBadge color="danger">3</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="archived">
              <IonLabel>Arquivadas</IonLabel>
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
                      <IonItem key={message.id} button className="message-item">
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
                        <IonBadge color="danger" className="unread-badge">1</IonBadge>
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

        <IonModal ref={modal} isOpen={isNewChatOpen} onDidDismiss={() => setIsNewChatOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nova Mensagem</IonTitle>
              <IonButton 
                slot="end" 
                fill="clear"
                onClick={() => setIsNewChatOpen(false)}
              >
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="new-message-form">
              <IonItem>
                <IonLabel position="stacked">Para</IonLabel>
                <IonInput placeholder="Digite o nome ou @ do usuário" />
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

              <div className="message-actions">
                <IonButton fill="clear">
                  <IonIcon icon={attach} slot="start" />
                  Anexar
                </IonButton>
                <IonButton fill="clear">
                  <IonIcon icon={camera} slot="start" />
                  Foto
                </IonButton>
              </div>

              <IonButton 
                expand="block" 
                onClick={handleSendMessage}
                disabled={!newMessageText.trim()}
              >
                <IonIcon icon={send} slot="start" />
                Enviar Mensagem
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}