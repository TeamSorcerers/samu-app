// Serviço para gerenciar armazenamento local de vídeos
export interface LocalVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channel: string;
  videoBlob: Blob;
  videoUrl: string;
  uploadDate: string;
  category: string;
  isPublic: boolean;
}

class LocalStorageService {
  private readonly VIDEO_KEY = 'samu_app_videos';
  private readonly VIDEO_BLOBS_KEY = 'samu_app_video_blobs';

  // Salvar vídeo no armazenamento local
  async saveVideo(video: Omit<LocalVideo, 'id' | 'uploadDate'>): Promise<string> {
    const videoId = this.generateId();
    const uploadDate = new Date().toISOString();
    

    // Salvar metadados no localStorage
    const existingVideos = this.getVideoMetadata();
    existingVideos.push({
      id: videoId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      duration: video.duration,
      channel: video.channel,
      videoUrl: video.videoUrl,
      uploadDate,
      category: video.category,
      isPublic: video.isPublic
    });
    
    localStorage.setItem(this.VIDEO_KEY, JSON.stringify(existingVideos));

    // Salvar blob do vídeo no IndexedDB
    await this.saveVideoBlob(videoId, video.videoBlob);

    return videoId;
  }

  // Obter metadados dos vídeos
  getVideoMetadata(): Array<Omit<LocalVideo, 'videoBlob'>> {
    const stored = localStorage.getItem(this.VIDEO_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Obter blob do vídeo
  async getVideoBlob(videoId: string): Promise<Blob | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('SamuAppVideos', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['videos'], 'readonly');
        const objectStore = transaction.objectStore('videos');
        const getRequest = objectStore.get(videoId);

        getRequest.onsuccess = () => {
          resolve(getRequest.result ? getRequest.result.blob : null);
        };

        getRequest.onerror = () => {
          resolve(null);
        };
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  // Salvar blob do vídeo no IndexedDB
  private async saveVideoBlob(videoId: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SamuAppVideos', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['videos'], 'readwrite');
        const objectStore = transaction.objectStore('videos');
        
        objectStore.add({ id: videoId, blob });

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = () => {
          reject(new Error('Erro ao salvar vídeo no IndexedDB'));
        };
      };

      request.onerror = () => {
        reject(new Error('Erro ao abrir IndexedDB'));
      };
    });
  }

  // Excluir vídeo
  async deleteVideo(videoId: string): Promise<void> {
    // Remover metadados
    const videos = this.getVideoMetadata();
    const filteredVideos = videos.filter(v => v.id !== videoId);
    localStorage.setItem(this.VIDEO_KEY, JSON.stringify(filteredVideos));

    // Remover blob do IndexedDB
    return new Promise((resolve) => {
      const request = indexedDB.open('SamuAppVideos', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['videos'], 'readwrite');
        const objectStore = transaction.objectStore('videos');
        
        objectStore.delete(videoId);
        
        transaction.oncomplete = () => {
          resolve();
        };
      };

      request.onerror = () => {
        resolve(); // Não falhar se não conseguir remover do IndexedDB
      };
    });
  }

  // Obter vídeo completo (metadados + blob)
  async getCompleteVideo(videoId: string): Promise<LocalVideo | null> {
    const metadata = this.getVideoMetadata().find(v => v.id === videoId);
    if (!metadata) return null;

    const blob = await this.getVideoBlob(videoId);
    if (!blob) return null;

    return {
      ...metadata,
      videoBlob: blob
    };
  }

  // Criar URL temporal para reprodução
  async createTemporaryVideoUrl(videoId: string): Promise<string | null> {
    const blob = await this.getVideoBlob(videoId);
    return blob ? URL.createObjectURL(blob) : null;
  }

  // Gerar ID único
  private generateId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Limpar todos os vídeos
  async clearAllVideos(): Promise<void> {
    localStorage.removeItem(this.VIDEO_KEY);
    
    return new Promise((resolve) => {
      const request = indexedDB.open('SamuAppVideos', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['videos'], 'readwrite');
        const objectStore = transaction.objectStore('videos');
        
        objectStore.clear();
        
        transaction.oncomplete = () => {
          resolve();
        };
      };

      request.onerror = () => {
        resolve();
      };
    });
  }
}

export const localStorageService = new LocalStorageService();