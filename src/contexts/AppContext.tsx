import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { localStorageService } from '../services/localStorage';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploadDate: string;
  channel: string;
  videoUrl?: string;
  isLocal?: boolean; // Para identificar vídeos salvos localmente
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: string;
  avatar: string;
}

interface AppContextType {
  videos: Video[];
  favoriteVideos: Video[];
  messages: Message[];
  addToFavorites: (video: Video) => void;
  removeFromFavorites: (videoId: string) => void;
  isFavorite: (videoId: string) => boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addVideo: (video: Omit<Video, 'id' | 'uploadDate' | 'views'>, videoBlob?: Blob, category?: string, isPublic?: boolean) => Promise<void>;
  getLocalVideoUrl: (videoId: string) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Como fazer um app incrível com Ionic React',
    description: 'Aprenda a criar aplicativos móveis incríveis usando Ionic e React.',
    thumbnail: 'https://picsum.photos/320/180?random=1',
    duration: '15:32',
    views: '125K',
    uploadDate: '2 dias atrás',
    channel: 'DevChannel'
  },
  {
    id: '2',
    title: 'Tutorial TypeScript para Iniciantes',
    description: 'Um guia completo de TypeScript do básico ao avançado.',
    thumbnail: 'https://picsum.photos/320/180?random=2',
    duration: '28:45',
    views: '89K',
    uploadDate: '5 dias atrás',
    channel: 'CodeMaster'
  },
  {
    id: '3',
    title: 'React Hooks Explicados',
    description: 'Entenda todos os hooks do React com exemplos práticos.',
    thumbnail: 'https://picsum.photos/320/180?random=3',
    duration: '22:15',
    views: '234K',
    uploadDate: '1 semana atrás',
    channel: 'ReactPro'
  },
  {
    id: '4',
    title: 'Design de Interface Mobile',
    description: 'Princípios de design para aplicativos móveis modernos.',
    thumbnail: 'https://picsum.photos/320/180?random=4',
    duration: '18:20',
    views: '67K',
    uploadDate: '3 dias atrás',
    channel: 'UXDesign'
  },
  {
    id: '5',
    title: 'JavaScript ES6+ Features',
    description: 'Explore as funcionalidades modernas do JavaScript.',
    thumbnail: 'https://picsum.photos/320/180?random=5',
    duration: '31:10',
    views: '156K',
    uploadDate: '1 dia atrás',
    channel: 'JSWorld'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Olá! Como você está?',
    timestamp: new Date(Date.now() - 3600000),
    sender: 'Ana Silva',
    avatar: 'https://picsum.photos/40/40?random=10'
  },
  {
    id: '2',
    text: 'Ótimo vídeo sobre Ionic!',
    timestamp: new Date(Date.now() - 7200000),
    sender: 'João Santos',
    avatar: 'https://picsum.photos/40/40?random=11'
  },
  {
    id: '3',
    text: 'Quando vai lançar o próximo tutorial?',
    timestamp: new Date(Date.now() - 10800000),
    sender: 'Maria Oliveira',
    avatar: 'https://picsum.photos/40/40?random=12'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [favoriteVideos, setFavoriteVideos] = useState<Video[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // Carregar vídeos locais ao inicializar
  useEffect(() => {
    const loadLocalVideos = () => {
      const localVideos = localStorageService.getVideoMetadata();
      const convertedVideos: Video[] = localVideos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        duration: video.duration,
        views: '0',
        uploadDate: new Date(video.uploadDate).toLocaleDateString(),
        channel: video.channel,
        videoUrl: video.videoUrl,
        isLocal: true
      }));
      
      setVideos(prev => [...convertedVideos, ...prev.filter(v => !v.isLocal)]);
    };

    loadLocalVideos();
  }, []);

  const addToFavorites = (video: Video) => {
    setFavoriteVideos(prev => {
      if (!prev.find(v => v.id === video.id)) {
        return [...prev, video];
      }
      return prev;
    });
  };

  const removeFromFavorites = (videoId: string) => {
    setFavoriteVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const isFavorite = (videoId: string) => {
    return favoriteVideos.some(v => v.id === videoId);
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addVideo = async (
    videoData: Omit<Video, 'id' | 'uploadDate' | 'views'>, 
    videoBlob?: Blob, 
    category: string = 'Geral', 
    isPublic: boolean = true
  ) => {
    try {
      let videoId: string;
      
      if (videoBlob) {
        // Salvar vídeo localmente
        videoId = await localStorageService.saveVideo({
          title: videoData.title,
          description: videoData.description,
          thumbnail: videoData.thumbnail,
          duration: videoData.duration,
          channel: videoData.channel,
          videoBlob: videoBlob,
          videoUrl: videoData.videoUrl || '',
          category,
          isPublic
        });
      } else {
        videoId = Date.now().toString();
      }

      const newVideo: Video = {
        ...videoData,
        id: videoId,
        uploadDate: 'Agora',
        views: '0',
        isLocal: !!videoBlob
      };
      
      setVideos(prev => [newVideo, ...prev]); // Adiciona no início da lista
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      throw error;
    }
  };

  const getLocalVideoUrl = async (videoId: string): Promise<string | null> => {
    try {
      return await localStorageService.createTemporaryVideoUrl(videoId);
    } catch (error) {
      console.error('Erro ao obter URL do vídeo local:', error);
      return null;
    }
  };

  return (
    <AppContext.Provider value={{
      videos,
      favoriteVideos,
      messages,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      addMessage,
      addVideo,
      getLocalVideoUrl
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}