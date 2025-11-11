import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  streamId: string;
  userId: string;
  data?: any;
}

// Store active connections per stream
const streams = new Map<string, Map<string, WebSocket>>();

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
        console.log("Received message:", message.type, "for stream:", message.streamId);

        if (message.type === 'join') {
          currentStreamId = message.streamId;
          currentUserId = message.userId;
          
          if (!streams.has(currentStreamId)) {
            streams.set(currentStreamId, new Map());
          }
          
          streams.get(currentStreamId)!.set(currentUserId, socket);
          console.log(`User ${currentUserId} joined stream ${currentStreamId}`);
          
          // Notify others in the stream
          broadcastToStream(currentStreamId, {
            type: 'user-joined',
            userId: currentUserId,
          }, currentUserId);
          
        } else if (message.type === 'leave') {
          handleLeave(socket, currentStreamId, currentUserId);
          
        } else if (message.type === 'offer' || message.type === 'answer' || message.type === 'ice-candidate') {
          // Forward signaling data to all viewers
          if (currentStreamId) {
            broadcastToStream(currentStreamId, message, currentUserId);
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

function broadcastToStream(streamId: string, message: any, excludeUserId?: string | null) {
  const streamSockets = streams.get(streamId);
  if (!streamSockets) return;

  const messageStr = JSON.stringify(message);
  
  streamSockets.forEach((socket, userId) => {
    if (userId !== excludeUserId && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(messageStr);
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
      }
    }
  });
}

function handleLeave(socket: WebSocket, streamId: string | null, userId: string | null) {
  if (streamId && userId) {
    const streamSockets = streams.get(streamId);
    if (streamSockets) {
      streamSockets.delete(userId);
      if (streamSockets.size === 0) {
        streams.delete(streamId);
      } else {
        broadcastToStream(streamId, {
          type: 'user-left',
          userId: userId,
        }, userId);
      }
    }
  }
}
