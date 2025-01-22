# Monitor Dashboard

Um dashboard em tempo real para monitoramento de sistemas e hardware, construído com React e Firebase.

## Configuração do Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase com Realtime Database configurado

### Configuração do Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Realtime Database
3. Copie o arquivo `src/firebase.example.js` para `src/firebase.js`
4. Atualize `firebase.js` com suas credenciais do Firebase
5. Baixe sua chave privada do Firebase (`firebase_private_key.json`) e coloque na raiz do projeto

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura do Projeto
- `/src` - Código fonte do frontend
  - `/components` - Componentes React
  - `App.jsx` - Componente principal
  - `firebase.js` - Configuração do Firebase (não versionado)
- `/public` - Arquivos estáticos

## Arquivos de Configuração
O projeto usa vários arquivos de configuração que não são versionados por segurança. Exemplos destes arquivos são fornecidos com o sufixo `.example`:

- `src/firebase.example.js` - Template para configuração do Firebase
- `.firebaserc.example` - Template para configuração do projeto Firebase
- `firebase.json.example` - Template para configuração de deploy

**Importante**: Nunca comite arquivos com credenciais ou informações sensíveis. Use os arquivos de exemplo como base para criar suas próprias configurações.

## Segurança
- Todos os arquivos sensíveis estão listados no `.gitignore`
- Credenciais devem ser configuradas como variáveis de ambiente em produção
- Nunca comite o arquivo `firebase_private_key.json` ou `firebase.js` com credenciais reais

## Deploy
O projeto está configurado para deploy no DigitalOcean App Platform. Certifique-se de configurar as seguintes variáveis de ambiente no ambiente de produção:
- Todas as credenciais do Firebase
- Outras configurações específicas do ambiente

## Últimas Atualizações
- Limpeza do repositório para remover informações sensíveis
- Adição de arquivos de exemplo para configuração
- Atualização do sistema de gerenciamento de credenciais
- Preparação para deploy no DigitalOcean

## Contribuindo
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
