const WS_URL = 'wss://wnwfnziozwarlihrnjex.supabase.co/functions/v1/webrtc-signaling';

export class WebRTCBroadcaster {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private ws: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private streamId: string;
  private userId: string;
  private onViewerCountChange?: (count: number) => void;

  constructor(streamId: string, userId: string, onViewerCountChange?: (count: number) => void) {
    this.streamId = streamId;
    this.userId = userId;
    this.onViewerCountChange = onViewerCountChange;
  }

  async start(stream: MediaStream) {
    this.localStream = stream;
    
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('Broadcaster WebSocket connected');
        this.ws?.send(JSON.stringify({
          type: 'join',
          streamId: this.streamId,
          userId: this.userId,
          role: 'broadcaster'
        }));
        resolve();
      };

      this.ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Broadcaster received:', message.type);

          if (message.type === 'viewer-joined') {
            const viewerId = message.fromUserId;
            console.log('Viewer joined:', viewerId);
            this.onViewerCountChange?.(this.peerConnections.size + 1);
            await this.createOfferForViewer(viewerId);
          } else if (message.type === 'answer') {
            const { fromUserId, data } = message;
            const pc = this.peerConnections.get(fromUserId);
            if (pc && data) {
              await pc.setRemoteDescription(new RTCSessionDescription(data));
            }
          } else if (message.type === 'ice-candidate') {
            const { fromUserId, data } = message;
            const pc = this.peerConnections.get(fromUserId);
            if (pc && data) {
              await pc.addIceCandidate(new RTCIceCandidate(data));
            }
          } else if (message.type === 'viewer-left') {
            const viewerId = message.fromUserId;
            const pc = this.peerConnections.get(viewerId);
            if (pc) {
              pc.close();
              this.peerConnections.delete(viewerId);
              this.onViewerCountChange?.(this.peerConnections.size);
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Broadcaster WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('Broadcaster WebSocket closed');
      };
    });
  }

  private async createOfferForViewer(viewerId: string) {
    console.log('Creating offer for viewer:', viewerId);
    
    if (!this.localStream) {
      console.error('No local stream available!');
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.peerConnections.set(viewerId, pc);

    // Add local stream tracks with detailed logging
    const tracks = this.localStream.getTracks();
    console.log(`Adding ${tracks.length} tracks to peer connection for viewer ${viewerId}`);
    
    tracks.forEach(track => {
      console.log(`Adding track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      pc.addTrack(track, this.localStream!);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.ws?.readyState === WebSocket.OPEN) {
        console.log('Sending ICE candidate to viewer:', viewerId);
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          streamId: this.streamId,
          userId: this.userId,
          toUserId: viewerId,
          data: event.candidate
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state for viewer', viewerId, ':', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.peerConnections.delete(viewerId);
        this.onViewerCountChange?.(this.peerConnections.size);
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    console.log('Sending offer to viewer:', viewerId);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'offer',
        streamId: this.streamId,
        userId: this.userId,
        toUserId: viewerId,
        data: offer
      }));
    }
  }

  stop() {
    console.log('Stopping broadcaster');
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'leave',
        streamId: this.streamId,
        userId: this.userId
      }));
      this.ws.close();
    }
    
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.localStream = null;
    this.ws = null;
  }
}

export class WebRTCViewer {
  private pc: RTCPeerConnection | null = null;
  private ws: WebSocket | null = null;
  private streamId: string;
  private userId: string;
  private onStream?: (stream: MediaStream) => void;

  constructor(streamId: string, userId: string, onStream?: (stream: MediaStream) => void) {
    this.streamId = streamId;
    this.userId = userId;
    this.onStream = onStream;
  }

  async start() {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('Viewer WebSocket connected');
        this.ws?.send(JSON.stringify({
          type: 'join',
          streamId: this.streamId,
          userId: this.userId,
          role: 'viewer'
        }));
        resolve();
      };

      this.ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Viewer received:', message.type);

          if (message.type === 'offer') {
            const { fromUserId, data } = message;
            if (data) {
              await this.handleOffer(data, fromUserId);
            }
          } else if (message.type === 'ice-candidate') {
            const { data } = message;
            if (this.pc && data) {
              await this.pc.addIceCandidate(new RTCIceCandidate(data));
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Viewer WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('Viewer WebSocket closed');
      };
    });
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, broadcasterId: string) {
    console.log('Handling offer from broadcaster:', broadcasterId);
    
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Handle incoming stream with detailed logging
    this.pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, 'enabled:', event.track.enabled, 'readyState:', event.track.readyState);
      console.log('Number of streams:', event.streams?.length);
      
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        const tracks = stream.getTracks();
        console.log('Remote stream has', tracks.length, 'tracks');
        tracks.forEach(track => {
          console.log(`Track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        });
        
        console.log('Calling onStream callback with remote stream');
        this.onStream?.(stream);
      } else {
        console.error('No streams in track event!');
      }
    };

    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.ws?.readyState === WebSocket.OPEN) {
        console.log('Sending ICE candidate to broadcaster');
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          streamId: this.streamId,
          userId: this.userId,
          toUserId: broadcasterId,
          data: event.candidate
        }));
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log('Viewer connection state:', this.pc?.connectionState);
    };

    // Set remote description and create answer
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    // Send answer
    console.log('Sending answer to broadcaster');
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'answer',
        streamId: this.streamId,
        userId: this.userId,
        toUserId: broadcasterId,
        data: answer
      }));
    }
  }

  stop() {
    console.log('Stopping viewer');
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'leave',
        streamId: this.streamId,
        userId: this.userId
      }));
      this.ws.close();
    }
    
    this.pc?.close();
    this.pc = null;
    this.ws = null;
  }
}
