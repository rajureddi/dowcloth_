/**
 * Realtime Order Tracking Service
 * Provides live order status updates, delivery tracking, map tracking,
 * driver location, ETA, push notifications, and Socket.io integration
 */

import io from 'socket.io-client';

class OrderTrackingService {
  constructor() {
    this.socket = null;
    this.currentOrder = null;
    this.listeners = {};
    this.isConnected = false;
  }

  /**
   * Initialize Socket.io connection
   */
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to order tracking server');
      this.isConnected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from order tracking server');
      this.isConnected = false;
      this.emit('connection_status', { connected: false });
    });

    this.socket.on('order_update', (data) => {
      console.log('📦 Order update received:', data);
      this.emit('order_update', data);
    });

    this.socket.on('driver_location', (data) => {
      console.log('🚗 Driver location update:', data);
      this.emit('driver_location', data);
    });

    this.socket.on('eta_update', (data) => {
      console.log('⏱️ ETA update:', data);
      this.emit('eta_update', data);
    });

    this.socket.on('push_notification', (data) => {
      console.log('🔔 Push notification:', data);
      this.showNotification(data);
      this.emit('push_notification', data);
    });

    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrder(orderId) {
    if (!this.socket) this.connect();
    
    this.currentOrder = orderId;
    this.socket.emit('subscribe_order', { orderId });
    console.log(`📡 Subscribed to order: ${orderId}`);
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrder() {
    if (this.socket && this.currentOrder) {
      this.socket.emit('unsubscribe_order', { orderId: this.currentOrder });
      this.currentOrder = null;
    }
  }

  /**
   * Get current order status (simulated)
   */
  async getOrderStatus(orderId) {
    // Simulated order status - in production, this would come from the server
    const statuses = [
      { status: 'confirmed', message: 'Order Confirmed', icon: '✅', progress: 10 },
      { status: 'processing', message: 'Processing', icon: '📦', progress: 25 },
      { status: 'shipped', message: 'Shipped', icon: '🚚', progress: 50 },
      { status: 'out_for_delivery', message: 'Out for Delivery', icon: '🚗', progress: 75 },
      { status: 'delivered', message: 'Delivered', icon: '🎉', progress: 100 }
    ];

    // Simulate random status based on order ID
    const index = parseInt(orderId.slice(-1)) % statuses.length;
    return statuses[index];
  }

  /**
   * Get driver location (simulated)
   */
  getDriverLocation(orderId) {
    // Simulated driver location - in production, this would come from GPS
    const baseLocations = [
      { lat: 12.9716, lng: 77.5946 }, // Bengaluru
      { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    ];

    const base = baseLocations[Math.floor(Math.random() * baseLocations.length)];
    
    return {
      lat: base.lat + (Math.random() - 0.5) * 0.1,
      lng: base.lng + (Math.random() - 0.5) * 0.1,
      heading: Math.random() * 360,
      speed: Math.random() * 40 + 10,
      driverName: 'Rajesh Kumar',
      vehicleNumber: 'KA 01 AB 1234',
      phone: '+91 98765 43210'
    };
  }

  /**
   * Get estimated delivery time
   */
  getETA(orderId) {
    // Simulated ETA calculation
    const baseTime = 30; // minutes
    const variance = Math.random() * 20 - 10;
    return Math.max(15, Math.round(baseTime + variance));
  }

  /**
   * Get delivery route (simulated waypoints)
   */
  getDeliveryRoute(orderId) {
    const warehouse = { lat: 12.9352, lng: 77.6245 };
    const destination = { lat: 12.9716, lng: 77.5946 };
    
    // Generate waypoints
    const waypoints = [];
    const steps = 5;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      waypoints.push({
        lat: warehouse.lat + (destination.lat - warehouse.lat) * ratio,
        lng: warehouse.lng + (destination.lng - warehouse.lng) * ratio
      });
    }

    return {
      origin: warehouse,
      destination,
      waypoints,
      distance: '5.2 km',
      duration: '15 mins'
    };
  }

  /**
   * Show browser notification
   */
  showNotification(data) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title || 'Order Update', {
        body: data.message,
        icon: '/logo192.png'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Simulate realtime updates (for demo purposes)
   */
  startSimulation(orderId) {
    let statusIndex = 0;
    const statuses = [
      { status: 'confirmed', message: 'Order Confirmed', icon: '✅', progress: 10 },
      { status: 'processing', message: 'Processing', icon: '📦', progress: 25 },
      { status: 'shipped', message: 'Shipped', icon: '🚚', progress: 50 },
      { status: 'out_for_delivery', message: 'Out for Delivery', icon: '🚗', progress: 75 },
      { status: 'delivered', message: 'Delivered', icon: '🎉', progress: 100 }
    ];

    const interval = setInterval(() => {
      if (statusIndex < statuses.length) {
        this.emit('order_update', {
          orderId,
          ...statuses[statusIndex],
          timestamp: Date.now()
        });

        // Simulate driver location updates
        if (statusIndex >= 3) {
          this.emit('driver_location', this.getDriverLocation(orderId));
        }

        // Simulate ETA updates
        this.emit('eta_update', {
          orderId,
          eta: this.getETA(orderId),
          timestamp: Date.now()
        });

        statusIndex++;
      } else {
        clearInterval(interval);
      }
    }, 5000); // Update every 5 seconds for demo

    return () => clearInterval(interval);
  }
}

export default new OrderTrackingService();
