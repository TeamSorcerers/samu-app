# SAMU App 📱

Um aplicativo móvel desenvolvido com Ionic React que oferece uma experiência similar ao YouTube, permitindo aos usuários navegar, gravar, favoritar vídeos e trocar mensagens.

## 🎯 Visão Geral

O SAMU App é um aplicativo móvel funcional que replica as principais funcionalidades de uma plataforma de vídeos, desenvolvido com tecnologias modernas e interface intuitiva inspirada no YouTube.

### ✨ Funcionalidades Principais

- **📹 Últimos Vídeos**: Navegue por uma feed de vídeos com sistema de filtros por categoria
- **🎥 Gravar Vídeo**: Grave vídeos diretamente pelo app com câmera integrada
- **❤️ Meus Favoritos**: Gerencie sua lista pessoal de vídeos favoritos
- **💬 Minhas Mensagens**: Sistema completo de mensagens e comunicação

## 🚀 Tecnologias Utilizadas

- **[Ionic Framework](https://ionicframework.com/)** - Framework híbrido para desenvolvimento móvel
- **[React](https://reactjs.org/)** - Biblioteca JavaScript para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem de programação tipada
- **[Capacitor](https://capacitorjs.com/)** - Runtime nativo para aplicações web
- **[Vite](https://vitejs.dev/)** - Build tool rápida e moderna
- **CSS3** - Estilização com variáveis CSS customizadas

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── VideoCard.tsx   # Card de exibição de vídeos
│   └── VideoCard.css   # Estilos do componente
├── contexts/            # Context API para gerenciamento de estado
│   └── AppContext.tsx  # Estado global da aplicação
├── pages/              # Páginas/Abas principais
│   ├── Tab1.tsx       # Últimos vídeos
│   ├── Tab2.tsx       # Gravar vídeo
│   ├── Tab3.tsx       # Meus favoritos
│   └── ChatBox.tsx    # Minhas mensagens
├── services/           # Serviços e utilitários
│   └── localStorage.ts # Gerenciamento de armazenamento local
├── theme/              # Configurações de tema
│   └── variables.css  # Variáveis CSS customizadas
└── App.tsx            # Componente raiz da aplicação
```

## 🎨 Interface e UX

### Tema Dark

- Interface moderna com tema escuro por padrão
- Cores inspiradas no YouTube com vermelho como cor primária
- Gradientes e sombras para profundidade visual
- Componentes responsivos e acessíveis

### Navegação

- **Tab Bar** inferior com 4 abas principais
- **Ícones intuitivos** para cada funcionalidade
- **Transições suaves** entre páginas
- **Feedback visual** para interações do usuário

## 📱 Funcionalidades Detalhadas

### 🎬 Últimos Vídeos (Tab 1)

- Lista de vídeos em formato de feed
- Filtros por categoria (Tecnologia, Educação, Entretenimento, etc.)
- Busca por título de vídeo
- Reprodução de vídeos com player integrado
- Sistema de favoritos com um clique
- Badges para vídeos salvos localmente

### 🎥 Gravação de Vídeo (Tab 2)

- **Câmera integrada** com controles nativos
- **Gravação em tempo real** com timer
- **Preview do vídeo** antes da publicação
- **Formulário completo** de metadados:
  - Título (obrigatório)
  - Descrição
  - Categoria
  - Configuração de privacidade (público/privado)
- **Upload de thumbnail** personalizada
- **Armazenamento local** com IndexedDB
- **Barra de progresso** durante publicação
- **Validação de campos** em tempo real

### ❤️ Meus Favoritos (Tab 3)

- Lista personalizada de vídeos favoritados
- Organização por categoria
- Remoção rápida de favoritos
- Contador de vídeos por categoria
- Estado vazio com call-to-action

### 💬 Mensagens (Tab 4)

- Lista de conversas organizadas
- Segmentação por tipo (Recentes, Arquivadas)
- Indicadores visuais para mensagens não lidas
- Formulário para nova mensagem
- Interface de chat moderna

## 💾 Armazenamento de Dados

### Local Storage

- **Metadados dos vídeos** salvos no localStorage do navegador
- **Configurações do usuário** e preferências
- **Lista de favoritos** persistente

### IndexedDB

- **Arquivos de vídeo** armazenados localmente
- **Blobs de vídeo** para reprodução offline
- **Thumbnails personalizadas** otimizadas

### Context API

- **Estado global** da aplicação
- **Gerenciamento de vídeos** em tempo real
- **Sistema de favoritos** sincronizado
- **Mensagens** e notificações

## 🔧 Instalação e Execução

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Git** para versionamento

### Passos para instalação

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd samu-app
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Execute o projeto em desenvolvimento**

   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:5173
   ```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run test         # Executar testes
npm run lint         # Verificar código
```

## 📦 Build e Deploy

### Build para Web

```bash
npm run build
```

### Build para Mobile (Android/iOS)

```bash
# Adicionar plataforma
npx cap add android
npx cap add ios

# Sincronizar assets
npx cap sync

# Abrir no IDE nativo
npx cap open android
npx cap open ios
```

## 🎯 Recursos Técnicos

### Gravação de Vídeo

- **MediaRecorder API** para gravação nativa
- **getUserMedia** para acesso à câmera
- **Canvas API** para geração de thumbnails
- **Blob URLs** para preview em tempo real
- **File API** para upload de thumbnails

### Performance

- **Lazy loading** de componentes
- **Otimização de imagens** automática
- **Gerenciamento de memória** para vídeos
- **Cleanup automático** de URLs temporárias

### Responsividade

- **Design mobile-first**
- **Breakpoints** para diferentes telas
- **Componentes adaptativos**
- **Touch gestures** otimizados

## 🧪 Testes e Qualidade

### Estrutura de Testes

- **Unit tests** com Jest
- **Component testing** com React Testing Library
- **E2E tests** com Cypress
- **Linting** com ESLint

### Execução dos Testes

```bash
npm run test         # Testes unitários
npm run test:e2e     # Testes E2E
npm run lint         # Análise de código
```


## 🤝 Contribuição

1. **Fork** o projeto
2. Crie sua **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.



## 🙏 Agradecimentos

- **Ionic Team** pela excelente documentação
- **React Team** pelo framework robusto
- **Capacitor** pela integração nativa
- **Comunidade open source** pelo suporte contínuo



---

⭐ **Não esqueça de dar uma estrela no projeto se ele foi útil para você!**
