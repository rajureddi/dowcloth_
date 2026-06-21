import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import orderTrackingService from '../services/orderTracking';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17RJ'; // Replace with your actual API key

const styles = {
  root: { minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: 'Poppins, sans-serif' },
  header: { 
    height: '80px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #F2F2F2', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100 
  },
  headerContent: { width: '100%', maxWidth: 'var(--max-width)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--padding-x)' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '800', letterSpacing: '2px' },
  headerLogo: { fontSize: '18px', fontWeight: '900', letterSpacing: '8px' },

  mainContent: { width: '100%', display: 'flex', justifyContent: 'center', padding: 'var(--padding-y) 0' },
  contentLayout: { 
    width: '100%', 
    maxWidth: 'var(--max-width)', 
    padding: '0 var(--padding-x)',
    display: 'flex', gap: '30px', flexWrap: 'wrap'
  },

  trackingSection: { flex: 1, minWidth: '350px' },
  title: { fontSize: 'var(--font-hero)', fontWeight: '900', marginBottom: '10px' },
  subtitle: { fontSize: 'var(--font-body)', color: '#666', marginBottom: '30px' },

  statusCard: { 
    backgroundColor: '#F9F9F9', borderRadius: '12px', padding: '25px',
    marginBottom: '25px', border: '1px solid #EEE'
  },
  orderId: { fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '15px' },
  statusBadge: { 
    display: 'inline-block', padding: '8px 20px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '800', letterSpacing: '1px',
    marginBottom: '20px'
  },
  statusConfirmed: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  statusProcessing: { backgroundColor: '#E3F2FD', color: '#1565C0' },
  statusShipped: { backgroundColor: '#FFF3E0', color: '#E65100' },
  statusOutForDelivery: { backgroundColor: '#F3E5F5', color: '#7B1FA2' },
  statusDelivered: { backgroundColor: '#E8F5E9', color: '#2E7D32' },

  progressBar: { height: '8px', backgroundColor: '#E0E0E0', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#000', transition: 'width 0.5s ease' },

  timeline: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  timelineItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  timelineDot: { 
    width: '30px', height: '30px', borderRadius: '50%',
    backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '14px', marginBottom: '8px'
  },
  timelineDotActive: { backgroundColor: '#000', color: '#FFF' },
  timelineDotCompleted: { backgroundColor: '#4CAF50', color: '#FFF' },
  timelineLabel: { fontSize: '9px', fontWeight: '600', textAlign: 'center', color: '#666' },

  etaCard: { 
    backgroundColor: '#E3F2FD', borderRadius: '12px', padding: '20px',
    marginBottom: '25px', border: '1px solid #BBDEFB'
  },
  etaTitle: { fontSize: '12px', fontWeight: '700', color: '#1565C0', marginBottom: '10px' },
  etaValue: { fontSize: '32px', fontWeight: '900', color: '#1565C0' },
  etaUnit: { fontSize: '14px', fontWeight: '600', color: '#1565C0' },

  driverCard: { 
    backgroundColor: '#FFF3E0', borderRadius: '12px', padding: '20px',
    marginBottom: '25px', border: '1px solid #FFE0B2'
  },
  driverInfo: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  driverAvatar: { 
    width: '50px', height: '50px', borderRadius: '50%',
    backgroundColor: '#FF9800', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px'
  },
  driverDetails: { flex: 1 },
  driverName: { fontSize: '14px', fontWeight: '700', marginBottom: '5px' },
  driverVehicle: { fontSize: '12px', color: '#666' },
  driverActions: { display: 'flex', gap: '10px' },
  driverActionBtn: { 
    padding: '10px 20px', borderRadius: '8px', border: 'none',
    cursor: 'pointer', fontSize: '11px', fontWeight: '700'
  },
  callBtn: { backgroundColor: '#4CAF50', color: '#FFF' },
  messageBtn: { backgroundColor: '#2196F3', color: '#FFF' },

  mapSection: { flex: 1, minWidth: '350px' },
  sectionTitle: { fontSize: '16px', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px' },
  mapContainer: { 
    height: '500px', borderRadius: '12px', overflow: 'hidden',
    border: '1px solid #EEE', marginBottom: '25px'
  },
  mapLegend: { 
    display: 'flex', gap: '20px', padding: '15px',
    backgroundColor: '#F9F9F9', borderRadius: '8px'
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  legendDot: { width: '12px', height: '12px', borderRadius: '50%' },
  legendText: { fontSize: '11px', fontWeight: '600', color: '#666' },

  notificationsSection: { marginBottom: '25px' },
  notificationCard: { 
    backgroundColor: '#FFF', borderRadius: '8px', padding: '15px',
    marginBottom: '10px', border: '1px solid #EEE', borderLeft: '4px solid #000'
  },
  notificationTime: { fontSize: '10px', color: '#999', marginBottom: '5px' },
  notificationText: { fontSize: '12px', fontWeight: '600' },

  liveIndicator: { 
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', backgroundColor: '#FF5252', color: '#FFF',
    borderRadius: '20px', fontSize: '11px', fontWeight: '700',
    marginBottom: '20px', alignSelf: 'flex-start'
  },
  liveDot: { 
    width: '8px', height: '8px', borderRadius: '50%',
    backgroundColor: '#FFF', animation: 'pulse 1.5s infinite'
  }
};

export default function OrderTrackingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-' + Date.now();
  
  const [orderStatus, setOrderStatus] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(30);
  const [deliveryRoute, setDeliveryRoute] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });

  const statusSteps = [
    { key: 'confirmed', icon: '✓', label: 'Confirmed' },
    { key: 'processing', icon: '📦', label: 'Processing' },
    { key: 'shipped', icon: '🚚', label: 'Shipped' },
    { key: 'out_for_delivery', icon: '🚗', label: 'Out for Delivery' },
    { key: 'delivered', icon: '🎉', label: 'Delivered' }
  ];

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setMapCenter(userLoc);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Use default location (Bengaluru)
          setMapCenter({ lat: 12.9716, lng: 77.5946 });
        }
      );
    }

    // Initialize tracking
    orderTrackingService.connect();
    orderTrackingService.subscribeToOrder(orderId);

    // Get initial data
    loadInitialData();

    // Setup event listeners
    orderTrackingService.on('order_update', handleOrderUpdate);
    orderTrackingService.on('driver_location', handleDriverLocation);
    orderTrackingService.on('eta_update', handleEtaUpdate);
    orderTrackingService.on('connection_status', handleConnectionStatus);

    // Request notification permission
    orderTrackingService.requestNotificationPermission();

    // Start simulation for demo
    const stopSimulation = orderTrackingService.startSimulation(orderId);

    return () => {
      orderTrackingService.unsubscribeFromOrder();
      orderTrackingService.off('order_update', handleOrderUpdate);
      orderTrackingService.off('driver_location', handleDriverLocation);
      orderTrackingService.off('eta_update', handleEtaUpdate);
      orderTrackingService.off('connection_status', handleConnectionStatus);
      stopSimulation?.();
    };
  }, [orderId]);

  const loadInitialData = async () => {
    const status = await orderTrackingService.getOrderStatus(orderId);
    setOrderStatus(status);
    
    const location = orderTrackingService.getDriverLocation(orderId);
    setDriverLocation(location);
    
    const route = orderTrackingService.getDeliveryRoute(orderId);
    setDeliveryRoute(route);
    
    const initialEta = orderTrackingService.getETA(orderId);
    setEta(initialEta);

    setNotifications([
      {
        time: new Date().toLocaleTimeString(),
        text: `Order ${orderId} confirmed. Preparing for shipment.`
      }
    ]);
  };

  const handleOrderUpdate = (data) => {
    setOrderStatus(data);
    addNotification(`Order status updated: ${data?.message || 'Update received'}`);
  };

  const handleDriverLocation = (data) => {
    setDriverLocation(data);
  };

  const handleEtaUpdate = (data) => {
    setEta(data.eta);
  };

  const handleConnectionStatus = (data) => {
    setIsConnected(data.connected);
  };

  const addNotification = (text) => {
    setNotifications(prev => [
      { time: new Date().toLocaleTimeString(), text },
      ...prev
    ].slice(0, 5));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'processing': return styles.statusProcessing;
      case 'shipped': return styles.statusShipped;
      case 'out_for_delivery': return styles.statusOutForDelivery;
      case 'delivered': return styles.statusDelivered;
      default: return styles.statusConfirmed;
    }
  };

  const getTimelineStatus = (stepKey) => {
    if (!orderStatus) return 'inactive';
    const currentIndex = statusSteps.findIndex(s => s.key === orderStatus?.status);
    const stepIndex = statusSteps.findIndex(s => s.key === stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'inactive';
  };

  const getTimelineDotStyle = (status) => {
    switch (status) {
      case 'active': return styles.timelineDotActive;
      case 'completed': return styles.timelineDotCompleted;
      default: return {};
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← BACK</button>
          <h1 style={styles.headerLogo}>DOWCLOTH</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.contentLayout}>
          {/* TRACKING SECTION */}
          <div style={styles.trackingSection}>
            <h1 style={styles.title}>REALTIME ORDER TRACKING</h1>
            <p style={styles.subtitle}>Track your order live with real-time updates and driver location</p>

            {/* LIVE INDICATOR */}
            <div style={styles.liveIndicator}>
              <div style={styles.liveDot} />
              LIVE TRACKING ACTIVE
            </div>

            {/* STATUS CARD */}
            <div style={styles.statusCard}>
              <div style={styles.orderId}>ORDER ID: {orderId}</div>
              
              {orderStatus && (
                <>
                  <div style={{...styles.statusBadge, ...getStatusStyle(orderStatus?.status)}}>
                    {orderStatus?.icon} {orderStatus?.message?.toUpperCase()}
                  </div>
                  
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${orderStatus?.progress || 0}%`}} />
                  </div>

                  <div style={styles.timeline}>
                    {statusSteps.map(step => {
                      const timelineStatus = getTimelineStatus(step.key);
                      return (
                        <div key={step.key} style={styles.timelineItem}>
                          <div style={{...styles.timelineDot, ...getTimelineDotStyle(timelineStatus)}}>
                            {timelineStatus === 'completed' ? '✓' : step.icon}
                          </div>
                          <span style={styles.timelineLabel}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* ETA CARD */}
            <div style={styles.etaCard}>
              <div style={styles.etaTitle}>ESTIMATED DELIVERY TIME</div>
              <div>
                <span style={styles.etaValue}>{eta}</span>
                <span style={styles.etaUnit}> mins</span>
              </div>
            </div>

            {/* DRIVER CARD */}
            {driverLocation && (
              <div style={styles.driverCard}>
                <div style={styles.driverInfo}>
                  <div style={styles.driverAvatar}>👨</div>
                  <div style={styles.driverDetails}>
                    <div style={styles.driverName}>{driverLocation?.driverName}</div>
                    <div style={styles.driverVehicle}>{driverLocation?.vehicleNumber} • {driverLocation?.speed?.toFixed(0)} km/h</div>
                  </div>
                </div>
                <div style={styles.driverActions}>
                  <button style={{...styles.driverActionBtn, ...styles.callBtn}}>
                    📞 CALL
                  </button>
                  <button style={{...styles.driverActionBtn, ...styles.messageBtn}}>
                    💬 MESSAGE
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            <div style={styles.notificationsSection}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>NOTIFICATIONS</h3>
              {notifications.map((notif, index) => (
                <div key={index} style={styles.notificationCard}>
                  <div style={styles.notificationTime}>{notif.time}</div>
                  <div style={styles.notificationText}>{notif.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MAP SECTION */}
          <div style={styles.mapSection}>
            <h2 style={styles.sectionTitle}>LIVE MAP TRACKING</h2>
            
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <div style={styles.mapContainer}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={13}
                >
                  {/* Origin marker - Warehouse */}
                  {deliveryRoute && deliveryRoute.origin && (
                    <Marker
                      position={{ lat: deliveryRoute.origin.lat, lng: deliveryRoute.origin.lng }}
                      label="📦"
                    />
                  )}

                  {/* Destination marker - User Location */}
                  {userLocation && (
                    <Marker
                      position={{ lat: userLocation.lat, lng: userLocation.lng }}
                      label="🏠"
                    />
                  )}

                  {/* Driver marker */}
                  {driverLocation && (
                    <Marker
                      position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
                      label="🚗"
                    />
                  )}

                  {/* Route polyline */}
                  {deliveryRoute && deliveryRoute.waypoints && (
                    <Polyline
                      path={deliveryRoute.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }))}
                      options={{
                        strokeColor: '#000000',
                        strokeOpacity: 0.7,
                        strokeWeight: 3
                      }}
                    />
                  )}
                </GoogleMap>
              </div>
            </LoadScript>

            {/* MAP LEGEND */}
            <div style={styles.mapLegend}>
              <div style={styles.legendItem}>
                <div style={{...styles.legendDot, backgroundColor: '#4CAF50'}} />
                <span style={styles.legendText}>Warehouse</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendDot, backgroundColor: '#2196F3'}} />
                <span style={styles.legendText}>Driver</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendDot, backgroundColor: '#FF9800'}} />
                <span style={styles.legendText}>Your Location</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
