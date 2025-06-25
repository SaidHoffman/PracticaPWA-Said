// app.js

// --- REGISTRAR SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado con éxito:', registration.scope);
        })
        .catch(error => {
          console.error('Error al registrar el Service Worker:', error);
        });
    });
  }
  

// Inicialización de variables
let db;

const messageList = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// IndexedDB - abrir base de datos
const request = indexedDB.open('chat-db', 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  const objectStore = db.createObjectStore('messages', { keyPath: 'timestamp' });
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log('IndexedDB lista.');
  loadMessages();
};

request.onerror = function(event) {
  console.error('Error abriendo IndexedDB:', event.target.errorCode);
};

// Manejar envío de mensaje
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const messageText = messageInput.value.trim();
  
  if (messageText !== '') {
    const message = {
      text: messageText,
      timestamp: Date.now()
    };

    addMessageToList(message);
    saveMessage(message);
    messageInput.value = '';
  }
});

// Función para mostrar un mensaje
function addMessageToList(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerHTML = `
    <p>${message.text}</p>
    <small>${new Date(message.timestamp).toLocaleTimeString()}</small>
  `;
  messageList.appendChild(messageElement);
  messageList.scrollTop = messageList.scrollHeight;
}

// Función para guardar mensaje en IndexedDB
function saveMessage(message) {
  const transaction = db.transaction(['messages'], 'readwrite');
  const store = transaction.objectStore('messages');
  store.add(message);
}

// Función para cargar mensajes de IndexedDB
function loadMessages() {
  const transaction = db.transaction(['messages'], 'readonly');
  const store = transaction.objectStore('messages');
  const request = store.openCursor();

  request.onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      addMessageToList(cursor.value);
      cursor.continue();
    }
  };
}
