import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://24-7-b.vercel.app';
    this.socket = io(API_BASE_URL, {
      transports: ['polling'],
      upgrade: false
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('order-status-update', (data) => {
      console.log('Order status updated:', data);
      // You can emit custom events here for the app to listen to
      window.dispatchEvent(new CustomEvent('orderStatusUpdate', { detail: data }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emitOrderPlaced(orderData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order-placed', orderData);
    }
  }

  onOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('order-status-update', callback);
    }
  }

  offOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.off('order-status-update', callback);
    }
  }
}

export default new SocketService();