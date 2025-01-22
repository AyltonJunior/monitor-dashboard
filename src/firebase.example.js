import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

console.log('Firebase: Iniciando configuração');

const firebaseConfig = {
  databaseURL: "YOUR_DATABASE_URL",
  authDomain: "YOUR_AUTH_DOMAIN"
};

console.log('Firebase: Tentando inicializar app');
const app = initializeApp(firebaseConfig);
console.log('Firebase: App inicializado com sucesso');

console.log('Firebase: Obtendo referência do banco de dados');
const database = getDatabase(app);
console.log('Firebase: Banco de dados conectado');

export { database };
