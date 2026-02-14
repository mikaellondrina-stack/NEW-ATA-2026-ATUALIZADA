// chat.js - Real-time Chat Synchronization with Firebase

// Import the Firebase library
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

// Firebase configuration object
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    databaseURL: 'YOUR_DATABASE_URL',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to send a message to the database
function sendMessage(user, message) {
    // Get a reference to the messages in the database
    const messageRef = ref(database, 'messages/');
    // Create a new message object
    const newMessage = {
        user: user,
        message: message,
        timestamp: new Date().toISOString(), // Store the timestamp
    };  
    // Push the new message to the database
    set(messageRef.push(), newMessage);
}

// Function to listen for new messages
function listenForMessages() {
    const messagesRef = ref(database, 'messages/');
    // Listen for changes to the messages data
    onValue(messagesRef, (snapshot) => {
        const messages = snapshot.val();
        if (messages) {
            // Process and display messages
            displayMessages(messages);
        }
    });
}

// Helper function to display messages on the UI
function displayMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = ''; // Clear previous messages
    Object.values(messages).forEach((msg) => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.user}: ${msg.message} - ${new Date(msg.timestamp).toLocaleString()}`;
        messagesContainer.appendChild(messageElement);
    });
}

// Initialize listening for messages when the script loads
listenForMessages();

// Example usage of sendMessage function
// sendMessage('User1', 'Hello, World!');

// Note: Replace 'YOUR_API_KEY' and other config values with actual Firebase project values.