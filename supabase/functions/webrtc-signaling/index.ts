const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalingMessage {
  type: 'join' | 'leave' | 'offer' | 'answer' | 'ice-candidate';
  streamId: string;
  userId: string;
  role?: 'broadcaster' | 'viewer';
  toUserId?: string;
  data?: any;
}

// Store active connections: streamId -> userId -> {socket, role}
const streams = new Map<string, Map<string, { socket: WebSocket; role: string }>>();

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Upgrade to WebSocket
  const upgrade = req.headers.get('upgrade') || '';
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  let currentStreamId: string | null = null;
  let currentUserId: string | null = null;

  socket.onopen = () => {
    console.log('WebSocket connection opened');
  };

  socket.onmessage = (event) => {
    try {
      const message: SignalingMessage = JSON.parse(event.data);
      console.log('Received message:', message.type, 'from user:', message.userId);

      const { type, streamId, userId, role, toUserId, data } = message;

      if (type === 'join') {
        // Initialize stream map if it doesn't exist
        if (!streams.has(streamId)) {
          streams.set(streamId, new Map());
        }

        const streamConnections = streams.get(streamId)!;
        
        // Add user to stream
        streamConnections.set(userId, { socket, role: role || 'viewer' });
        currentStreamId = streamId;
        currentUserId = userId;

        console.log(`User ${userId} joined stream ${streamId} as ${role}`);
        console.log(`Current viewers in stream ${streamId}:`, streamConnections.size);

        // If viewer joined, notify broadcaster
        if (role === 'viewer') {
          streamConnections.forEach((conn, connUserId) => {
            if (conn.role === 'broadcaster' && conn.socket.readyState === WebSocket.OPEN) {
              conn.socket.send(JSON.stringify({
                type: 'viewer-joined',
                fromUserId: userId,
                streamId
              }));
              console.log(`Notified broadcaster about viewer ${userId}`);
            }
          });
        }
      } else if (type === 'leave') {
        handleLeave(streamId, userId);
      } else if (['offer', 'answer', 'ice-candidate'].includes(type)) {
        // Forward message to specific user
        const streamConnections = streams.get(streamId);
        if (streamConnections && toUserId) {
          const targetConnection = streamConnections.get(toUserId);
          if (targetConnection && targetConnection.socket.readyState === WebSocket.OPEN) {
            targetConnection.socket.send(JSON.stringify({
              type,
              fromUserId: userId,
              data,
              streamId
            }));
            console.log(`Forwarded ${type} from ${userId} to ${toUserId}`);
          } else {
            console.log(`Target user ${toUserId} not found or socket closed`);
          }
        } else {
          console.log(`Stream ${streamId} not found or no target user specified`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
    if (currentStreamId && currentUserId) {
      handleLeave(currentStreamId, currentUserId);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  function handleLeave(streamId: string, userId: string) {
    const streamConnections = streams.get(streamId);
    if (streamConnections) {
      const userConnection = streamConnections.get(userId);
      streamConnections.delete(userId);
      
      console.log(`User ${userId} left stream ${streamId}`);
      console.log(`Remaining viewers in stream ${streamId}:`, streamConnections.size);

      // Notify broadcaster if viewer left
      if (userConnection?.role === 'viewer') {
        streamConnections.forEach((conn, connUserId) => {
          if (conn.role === 'broadcaster' && conn.socket.readyState === WebSocket.OPEN) {
            conn.socket.send(JSON.stringify({
              type: 'viewer-left',
              fromUserId: userId,
              streamId
            }));
            console.log(`Notified broadcaster that viewer ${userId} left`);
          }
        });
      }

      // Clean up empty streams
      if (streamConnections.size === 0) {
        streams.delete(streamId);
        console.log(`Stream ${streamId} removed (no more connections)`);
      }
    }
  }

  return response;
});
