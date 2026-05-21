/**
 * Socket.IO Service - Real-time events for incidents and notifications
 */

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'nurisk-secret-key';

/**
 * Extract and validate JWT from socket handshake
 */
const authenticateSocket = async (socket) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { authenticated: true, user: decoded };
  } catch (err) {
    return { authenticated: false, error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' };
  }
};

/**
 * Setup socket events
 */
const setupSocketEvents = (io) => {
  
  // Middleware: Authentication
  io.use(async (socket, next) => {
    const auth = await authenticateSocket(socket);
    if (!auth.authenticated) {
      return next(new Error('Unauthorized'));
    }
    socket.user = auth.user;
    next();
  });
  
  io.on('connection', (socket) => {
    console.log(`[SOCKET] User terhubung: ${socket.id} (${socket.user?.id})`);
    
    // Join user's personal room
    if (socket.user?.id) {
      socket.join(`user_${socket.user.id}`);
    }
    
    // --- INCIDENT ROOMS (T03) ---
    socket.on('join_incident', async (incidentId) => {
      if (!incidentId) return;
      socket.join(`incident_${incidentId}`);
      console.log(`[SOCKET] ${socket.id} joined incident_${incidentId}`);
    });
    
    socket.on('leave_incident', (incidentId) => {
      if (!incidentId) return;
      socket.leave(`incident_${incidentId}`);
    });
    
    // --- REGION ROOMS (T03) ---
    socket.on('join_region', async (regionId) => {
      if (!regionId) return;
      socket.join(`region_${regionId}`);
      console.log(`[SOCKET] ${socket.id} joined region_${regionId}`);
    });
    
    socket.on('leave_region', (regionId) => {
      if (!regionId) return;
      socket.leave(`region_${regionId}`);
    });
    
    // --- NOTIFICATIONS ---
    socket.on('join_notifications', () => {
      socket.join('notifications');
    });

    // --- TACTICAL AWARENESS (F01) ---
    socket.on('subscribe:tactical', async ({ regionId }) => {
      if (!regionId) return;
      socket.join(`tactical_${regionId}`);
      console.log(`[SOCKET] ${socket.id} subscribed to tactical_${regionId}`);
    });

    socket.on('unsubscribe:tactical', (regionId) => {
      if (!regionId) return;
      socket.leave(`tactical_${regionId}`);
    });

    // --- CHAT ROOMS (T02) ---
    socket.on('join_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation_${conversationId}`);
      console.log(`[SOCKET] ${socket.id} joined conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation_${conversationId}`);
    });

    // --- TYPING EVENT (T02) ---
    socket.on('typing', ({ conversationId, userId }) => {
      if (!conversationId || !userId) return;
      socket.to(`conversation_${conversationId}`).emit('chat.conversation.typing', { userId });
    });

    // --- DISCONNECT (T03) ---
    socket.on('disconnect', () => {
      console.log(`[SOCKET] User terputus: ${socket.id}`);
    });
  });
};

/**
 * Emit incident update to room
 */
const emitIncidentUpdate = (io, incidentId, event, data) => {
  io.to(`incident_${incidentId}`).emit(event, data);
};

/**
 * Emit region broadcast
 */
const emitRegionBroadcast = (io, regionId, event, data) => {
  io.to(`region_${regionId}`).emit(event, data);
};

/**
 * Emit to user
 */
const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

/**
 * Emit notification
 */
const emitNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', notification);
  io.to('notifications').emit('notification', notification);
};

/**
 * Emit tactical update to region room
 */
const emitTacticalUpdate = (io, regionId, snapshot) => {
  io.to(`tactical_${regionId}`).emit('tactical.update', snapshot);
};

module.exports = {
  setupSocketEvents,
  authenticateSocket,
  emitIncidentUpdate,
  emitRegionBroadcast,
  emitToUser,
  emitNotification,
  emitTacticalUpdate
};