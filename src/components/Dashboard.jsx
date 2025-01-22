import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Fade,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ComputerIcon from '@mui/icons-material/Computer';
import MemoryIcon from '@mui/icons-material/Memory';
import DevicesIcon from '@mui/icons-material/Devices';
import AppsIcon from '@mui/icons-material/Apps';
import DnsIcon from '@mui/icons-material/Dns';
import StorageIcon from '@mui/icons-material/Storage';
import UpdateIcon from '@mui/icons-material/Update';
import StoreIcon from '@mui/icons-material/Store';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusIndicator = styled(Box)(({ status, theme }) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  marginRight: 8,
  backgroundColor: status === 'ONLINE' || status === 'RODANDO' 
    ? theme.palette.success.main 
    : theme.palette.error.main,
  boxShadow: `0 0 8px ${status === 'ONLINE' || status === 'RODANDO' 
    ? theme.palette.success.main 
    : theme.palette.error.main}`,
  transition: 'all 0.3s ease',
}));

const SectionTitle = ({ icon: Icon, title }) => {
  const theme = useTheme();
  return (
    <Box component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Icon sx={{ mr: 1, color: theme.palette.primary.main }} />
      <Typography component="h2" variant="h6">{title}</Typography>
    </Box>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const theme = useTheme();
  const { storeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storeRef = ref(database, `stores/${storeId}`);
      
      const unsubscribe = onValue(storeRef, (snapshot) => {
        const storeData = snapshot.val();
        if (!storeData) {
          setError('Loja não encontrada');
          setLoading(false);
          return;
        }
        setData(storeData);
        setLastUpdate(new Date().toLocaleString('pt-BR'));
        setLoading(false);
      }, (error) => {
        console.error('Dashboard: Erro ao conectar com Firebase:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Dashboard: Erro ao configurar Firebase:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [storeId]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/');
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">Erro: {error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Nenhum dado encontrado. Verifique se o monitor Python está enviando dados para stores/{storeId}</Typography>
      </Box>
    );
  }

  return (
    <Box component="div" sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <StoreIcon sx={{ mr: 2 }} />
          <Typography component="h1" variant="h6" sx={{ flexGrow: 1 }}>
            Monitor de Sistema - Loja {data.store_code || storeId}
          </Typography>
          <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <UpdateIcon sx={{ mr: 1 }} />
            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              Última atualização: {lastUpdate}
            </Typography>
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Espaçador para o conteúdo não ficar sob a AppBar */}
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Fade in={true} timeout={800}>
          <Grid container spacing={3}>
            {/* Hardware Info */}
            <Grid item xs={12} md={6}>
              <Item>
                <SectionTitle icon={ComputerIcon} title="Informações do Sistema" />
                {data?.hardware?.system && (
                  <Box component="div" sx={{ '& > *': { mb: 1 } }}>
                    <Typography component="p">Sistema Operacional: {data.hardware.system.os}</Typography>
                    <Typography component="p">Processador: {data.hardware.system.processor}</Typography>
                    <Typography component="p">Núcleos/Threads: {data.hardware.system.cpu_count}</Typography>
                  </Box>
                )}
                {data?.hardware?.cpu && (
                  <Box component="div" sx={{ mt: 2 }}>
                    <Typography component="p">Uso de CPU: {data.hardware.cpu.cpu_percent}%</Typography>
                    <Typography component="p">
                      Frequência: {Math.round(data.hardware.cpu.cpu_freq.current)} MHz
                    </Typography>
                  </Box>
                )}
              </Item>
            </Grid>

            {/* Memory Info */}
            <Grid item xs={12} md={6}>
              <Item>
                <SectionTitle icon={MemoryIcon} title="Memória" />
                {data?.hardware?.memory && (
                  <Box component="div" sx={{ '& > *': { mb: 1 } }}>
                    <Typography component="p">Total: {data.hardware.memory.total}</Typography>
                    <Typography component="p">Disponível: {data.hardware.memory.available}</Typography>
                    <Typography component="p">Em Uso: {data.hardware.memory.percent}%</Typography>
                  </Box>
                )}
              </Item>
            </Grid>

            {/* Devices */}
            <Grid item xs={12}>
              <Item>
                <SectionTitle icon={DevicesIcon} title="Dispositivos" />
                <Grid container spacing={2}>
                  {Object.entries(data?.devices || {}).map(([deviceName, device]) => (
                    <Grid item xs={12} sm={6} md={4} key={deviceName}>
                      <Box
                        component="div"
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <StatusIndicator status={device.status} />
                        <Box component="div" sx={{ flexGrow: 1 }}>
                          <Typography component="h3" variant="subtitle1">{deviceName}</Typography>
                          <Typography component="p" variant="body2" color="text.secondary">
                            IP: {device.ip}
                          </Typography>
                          <Typography component="p" variant="body2" color="text.secondary">
                            Status: {device.status}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Item>
            </Grid>

            {/* Applications */}
            <Grid item xs={12} md={6}>
              <Item>
                <SectionTitle icon={AppsIcon} title="Aplicativos" />
                {Object.entries(data?.applications || {}).map(([appName, app]) => (
                  <Box
                    component="div"
                    key={appName}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <StatusIndicator status={app.status} />
                    <Box component="div" sx={{ flexGrow: 1 }}>
                      <Typography component="h3" variant="subtitle1">{appName}</Typography>
                      <Typography component="p" variant="body2" color="text.secondary">
                        Status: {app.status}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Item>
            </Grid>

            {/* Servers */}
            <Grid item xs={12} md={6}>
              <Item>
                <SectionTitle icon={DnsIcon} title="Servidores" />
                {Object.entries(data?.servers || {}).map(([serverName, server]) => (
                  <Box
                    component="div"
                    key={serverName}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <StatusIndicator status={server.status} />
                    <Box component="div" sx={{ flexGrow: 1 }}>
                      <Typography component="h3" variant="subtitle1">{serverName}</Typography>
                      <Typography component="p" variant="body2" color="text.secondary">
                        Status: {server.status}
                      </Typography>
                      <Typography component="p" variant="body2" color="text.secondary">
                        Porta: {server.port}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Item>
            </Grid>

            {/* Disk Info */}
            <Grid item xs={12}>
              <Item>
                <SectionTitle icon={StorageIcon} title="Discos" />
                <Grid container spacing={2}>
                  {data?.hardware?.disk && Object.entries(data.hardware.disk).map(([device, info]) => (
                    <Grid item xs={12} sm={6} md={4} key={device}>
                      <Box
                        component="div"
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Typography component="h3" variant="subtitle1">{device}</Typography>
                        <Box component="div" sx={{ flexGrow: 1 }}>
                          <Typography component="p" variant="body2">Total: {info.total}</Typography>
                          <Typography component="p" variant="body2">Usado: {info.used} ({info.percent}%)</Typography>
                          <Typography component="p" variant="body2">Livre: {info.free}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Item>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
}
