import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  streamId: string;
  userId: string;
  toUserId?: string;
  fromUserId?: string;
  role?: 'broadcaster' | 'viewer';
  data?: any;
}

// Store active connections per stream with roles
const streams = new Map<string, Map<string, { socket: WebSocket, role: string }>>();

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    let currentStreamId: string | null = null;
    let currentUserId: string | null = null;

    socket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    socket.onmessage = (event) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data);
        console.log("Received:", message.type, "from:", message.userId, "role:", message.role);

        if (message.type === 'join') {
          currentStreamId = message.streamId;
          currentUserId = message.userId;
          const role = message.role || 'viewer';
          
          if (!streams.has(currentStreamId)) {
            streams.set(currentStreamId, new Map());
          }
          
          const streamUsers = streams.get(currentStreamId)!;
          streamUsers.set(currentUserId, { socket, role });
          console.log(`${role} ${currentUserId} joined stream ${currentStreamId}`);
          
          // If a viewer joins, notify the broadcaster
          if (role === 'viewer') {
            streamUsers.forEach((user, userId) => {
              if (user.role === 'broadcaster' && user.socket.readyState === WebSocket.OPEN) {
                user.socket.send(JSON.stringify({
                  type: 'viewer-joined',
                  fromUserId: currentUserId,
                  streamId: currentStreamId
                }));
              }
            });
          }
          
        } else if (message.type === 'leave') {
          handleLeave(socket, currentStreamId, currentUserId);
          
        } else if (message.type === 'offer' || message.type === 'answer' || message.type === 'ice-candidate') {
          // Route message to specific user
          if (currentStreamId && message.toUserId) {
            const targetUser = streams.get(currentStreamId)?.get(message.toUserId);
            if (targetUser && targetUser.socket.readyState === WebSocket.OPEN) {
              targetUser.socket.send(JSON.stringify({
                ...message,
                fromUserId: currentUserId
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      handleLeave(socket, currentStreamId, currentUserId);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return response;
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


function handleLeave(socket: WebSocket, streamId: string | null, userId: string | null) {
  if (streamId && userId) {
    const streamUsers = streams.get(streamId);
    if (streamUsers) {
      const userInfo = streamUsers.get(userId);
      streamUsers.delete(userId);
      
      if (streamUsers.size === 0) {
        streams.delete(streamId);
      } else if (userInfo?.role === 'viewer') {
        // Notify broadcaster that viewer left
        streamUsers.forEach((user) => {
          if (user.role === 'broadcaster' && user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify({
              type: 'viewer-left',
              fromUserId: userId,
              streamId: streamId
            }));
          }
        });
      }
      console.log(`User ${userId} left stream ${streamId}`);
    }
  }
}
