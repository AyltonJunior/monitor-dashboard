import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Fade,
  useTheme,
  Tooltip
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { styled } from '@mui/material/styles';

// Tempo máximo sem atualização antes de considerar offline (5 minutos em milissegundos)
const OFFLINE_THRESHOLD = 5 * 60 * 1000;

const StatusBadge = styled('div')(({ status, theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: status === 'online' ? theme.palette.success.main : theme.palette.error.main,
  boxShadow: `0 0 8px ${status === 'online' ? theme.palette.success.main : theme.palette.error.main}`,
}));

const StoreCard = styled(Card)(({ theme }) => ({
  height: '100%',
  position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

// Função para calcular o tempo desde a última atualização
const getTimeSinceLastUpdate = (lastUpdateTime) => {
  if (!lastUpdateTime) return 'Nunca atualizado';
  
  const now = Date.now();
  const diff = now - lastUpdateTime;
  
  if (diff < 60000) { // menos de 1 minuto
    return 'Agora mesmo';
  } else if (diff < 3600000) { // menos de 1 hora
    const minutes = Math.floor(diff / 60000);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
  } else if (diff < 86400000) { // menos de 1 dia
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
  }
};

// Função para verificar se a loja está online baseado no timestamp
const isStoreOnline = (lastUpdateTime) => {
  if (!lastUpdateTime) return false;
  return (Date.now() - lastUpdateTime) < OFFLINE_THRESHOLD;
};

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Efeito para atualizar o status das lojas a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setStores(currentStores => 
        currentStores.map(store => ({
          ...store,
          status: isStoreOnline(store.lastUpdateTimestamp) ? 'online' : 'offline',
          timeSinceUpdate: getTimeSinceLastUpdate(store.lastUpdateTimestamp)
        }))
      );
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storesRef = ref(database, 'stores');
    
    const unsubscribe = onValue(storesRef, (snapshot) => {
      if (snapshot.exists()) {
        const storesData = snapshot.val();
        const storesList = Object.entries(storesData).map(([id, data]) => {
          const lastUpdateTimestamp = data.lastUpdate || Date.now(); // Usar timestamp do Firebase ou atual
          return {
            id,
            ...data,
            lastUpdateTimestamp,
            status: isStoreOnline(lastUpdateTimestamp) ? 'online' : 'offline',
            timeSinceUpdate: getTimeSinceLastUpdate(lastUpdateTimestamp)
          };
        });
        setStores(storesList);
      }
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar lojas:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStoreClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column" p={3}>
        <Typography variant="h6" color="error" gutterBottom align="center">
          Erro ao carregar lojas
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ maxWidth: 600 }}>
          {error.includes('permission_denied') 
            ? "Sem permissão para acessar os dados. Por favor, verifique as regras de segurança do Firebase."
            : error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <StoreIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Monitor de Lojas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stores.length} {stores.length === 1 ? 'Loja' : 'Lojas'} Monitoradas
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Fade in={true} timeout={800}>
          <Grid container spacing={3}>
            {stores.map((store) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={store.id}>
                <StoreCard>
                  <StatusBadge status={store.status} />
                  <CardActionArea 
                    onClick={() => handleStoreClick(store.id)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StorefrontIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography component="h3" variant="h6">
                          Loja {store.store_code || store.id}
                        </Typography>
                      </Box>
                      
                      <Typography component="p" variant="body2" color="text.secondary" gutterBottom>
                        Status: {store.status === 'online' ? 'Online' : 'Offline'}
                      </Typography>
                      
                      {store.hardware?.system && (
                        <Box component="div">
                          <Typography component="p" variant="body2" color="text.secondary">
                            Sistema: {store.hardware.system.os}
                          </Typography>
                          <Typography component="p" variant="body2" color="text.secondary">
                            CPU: {store.hardware.cpu?.cpu_percent}%
                          </Typography>
                          <Typography component="p" variant="body2" color="text.secondary">
                            Memória: {store.hardware.memory?.percent}%
                          </Typography>
                        </Box>
                      )}
                      
                      <Box 
                        component="div"
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 2,
                          color: store.status === 'online' ? 'success.main' : 'error.main'
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Tooltip title={new Date(store.lastUpdateTimestamp).toLocaleString('pt-BR')}>
                          <Typography 
                            component="span"
                            variant="caption"
                            sx={{ fontStyle: 'italic' }}
                          >
                            {store.timeSinceUpdate}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </StoreCard>
              </Grid>
            ))}
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
}
