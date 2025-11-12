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
    
    // Connect to signaling server
    const wsUrl = `wss://wnwfnziozwarlihrnjex.supabase.co/functions/v1/webrtc-signaling`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Broadcaster connected to signaling server');
      this.ws?.send(JSON.stringify({
        type: 'join',
        streamId: this.streamId,
        userId: this.userId,
        role: 'broadcaster'
      }));
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log('Broadcaster received:', message.type, 'from:', message.fromUserId);

      if (message.type === 'viewer-joined') {
        const viewerId = message.fromUserId;
        this.onViewerCountChange?.(this.peerConnections.size + 1);
        await this.createOfferForViewer(viewerId);
      } else if (message.type === 'viewer-left') {
        const viewerId = message.fromUserId;
        const pc = this.peerConnections.get(viewerId);
        if (pc) {
          pc.close();
          this.peerConnections.delete(viewerId);
          this.onViewerCountChange?.(this.peerConnections.size);
        }
      } else if (message.type === 'answer' && message.data && message.fromUserId) {
        const pc = this.peerConnections.get(message.fromUserId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
        }
      } else if (message.type === 'ice-candidate' && message.data && message.fromUserId) {
        const pc = this.peerConnections.get(message.fromUserId);
        if (pc && message.data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(message.data));
        }
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private async createOfferForViewer(viewerId: string) {
    console.log('Creating offer for viewer:', viewerId);
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.peerConnections.set(viewerId, pc);

    // Add local stream tracks
    this.localStream?.getTracks().forEach(track => {
      console.log('Adding track to peer connection:', track.kind);
      pc.addTrack(track, this.localStream!);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to viewer:', viewerId);
        this.ws?.send(JSON.stringify({
          type: 'ice-candidate',
          streamId: this.streamId,
          userId: this.userId,
          toUserId: viewerId,
          data: event.candidate,
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state for viewer', viewerId, ':', pc.connectionState);
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    console.log('Sending offer to viewer:', viewerId);
    this.ws?.send(JSON.stringify({
      type: 'offer',
      streamId: this.streamId,
      userId: this.userId,
      toUserId: viewerId,
      data: offer,
    }));
  }

  stop() {
    console.log('Stopping broadcaster');
    this.ws?.send(JSON.stringify({
      type: 'leave',
      streamId: this.streamId,
      userId: this.userId,
    }));
    
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.ws?.close();
    this.localStream = null;
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
    const wsUrl = `wss://wnwfnziozwarlihrnjex.supabase.co/functions/v1/webrtc-signaling`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Viewer connected to signaling server');
      this.ws?.send(JSON.stringify({
        type: 'join',
        streamId: this.streamId,
        userId: this.userId,
        role: 'viewer'
      }));
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log('Viewer received:', message.type);

      if (message.type === 'offer' && message.data && message.toUserId === this.userId) {
        await this.handleOffer(message.data, message.fromUserId);
      } else if (message.type === 'ice-candidate' && message.data && message.toUserId === this.userId) {
        if (this.pc && message.data.candidate) {
          await this.pc.addIceCandidate(new RTCIceCandidate(message.data));
        }
      }
    };

    this.ws.onerror = (error) => {
      console.error('Viewer WebSocket error:', error);
    };
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, broadcasterId: string) {
    console.log('Handling offer from broadcaster:', broadcasterId);
    
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Handle incoming stream
    this.pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        console.log('Setting remote stream');
        this.onStream?.(event.streams[0]);
      }
    };

    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to broadcaster');
        this.ws?.send(JSON.stringify({
          type: 'ice-candidate',
          streamId: this.streamId,
          userId: this.userId,
          toUserId: broadcasterId,
          data: event.candidate,
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
    this.ws?.send(JSON.stringify({
      type: 'answer',
      streamId: this.streamId,
      userId: this.userId,
      toUserId: broadcasterId,
      data: answer,
    }));
  }

  stop() {
    console.log('Stopping viewer');
    this.ws?.send(JSON.stringify({
      type: 'leave',
      streamId: this.streamId,
      userId: this.userId,
    }));
    
    this.pc?.close();
    this.ws?.close();
  }
}
