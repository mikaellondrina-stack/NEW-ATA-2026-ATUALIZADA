// supabase-config.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

let isConnected = false;
let pendingOperations = [];

const savePendingOperation = (operation) => {
    pendingOperations.push(operation);
    localStorage.setItem('pendingOperations', JSON.stringify(pendingOperations));
};

const executePendingOperations = async () => {
    while (pendingOperations.length > 0) {
        const operation = pendingOperations.shift();
        await operation(); // assuming operation is a function
    }
};

const syncPendingOperations = () => {
    const savedOperations = JSON.parse(localStorage.getItem('pendingOperations')) || [];
    pendingOperations = savedOperations;
    executePendingOperations();
};

const handleOnline = () => {
    isConnected = true;
    syncPendingOperations();
};

const handleOffline = () => {
    isConnected = false;
};

window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

const reconnect = () => {
    if (!isConnected) {
        // Try to reconnect logic here (could be an API call or similar)
        setTimeout(reconnect, 5000); // Try again after 5 seconds
    }
};

window.addEventListener('error', (e) => {
    console.error('Error occurred:', e);
    reconnect();
});

export { supabase, savePendingOperation };