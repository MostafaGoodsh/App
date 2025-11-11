export class WebRTCBroadcaster {
  private pc: RTCPeerConnection | null = null;
  private ws: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private streamId: string;
  private userId: string;
  private onViewerCountChange?: (count: number) => void;
  private viewers = new Set<string>();

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
      console.log('Connected to signaling server');
      this.ws?.send(JSON.stringify({
        type: 'join',
        streamId: this.streamId,
        userId: this.userId,
      }));
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log('Received signaling message:', message.type);

      if (message.type === 'user-joined') {
        this.viewers.add(message.userId);
        this.onViewerCountChange?.(this.viewers.size);
        await this.createOfferForViewer();
      } else if (message.type === 'user-left') {
        this.viewers.delete(message.userId);
        this.onViewerCountChange?.(this.viewers.size);
      } else if (message.type === 'answer' && message.data) {
        await this.pc?.setRemoteDescription(new RTCSessionDescription(message.data));
      } else if (message.type === 'ice-candidate' && message.data) {
        await this.pc?.addIceCandidate(new RTCIceCandidate(message.data));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private async createOfferForViewer() {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Add local stream tracks
    this.localStream?.getTracks().forEach(track => {
      this.pc?.addTrack(track, this.localStream!);
    });

    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws?.send(JSON.stringify({
          type: 'ice-candidate',
          streamId: this.streamId,
          userId: this.userId,
          data: event.candidate,
        }));
      }
    };

    // Create and send offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    
    this.ws?.send(JSON.stringify({
      type: 'offer',
      streamId: this.streamId,
      userId: this.userId,
      data: offer,
    }));
  }

  stop() {
    this.ws?.send(JSON.stringify({
      type: 'leave',
      streamId: this.streamId,
      userId: this.userId,
    }));
    
    this.pc?.close();
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
      }));
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log('Viewer received message:', message.type);

      if (message.type === 'offer' && message.data) {
        await this.handleOffer(message.data);
      } else if (message.type === 'ice-candidate' && message.data) {
        await this.pc?.addIceCandidate(new RTCIceCandidate(message.data));
      }
    };
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Handle incoming stream
    this.pc.ontrack = (event) => {
      console.log('Received remote stream');
      this.onStream?.(event.streams[0]);
    };

    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws?.send(JSON.stringify({
          type: 'ice-candidate',
          streamId: this.streamId,
          userId: this.userId,
          data: event.candidate,
        }));
      }
    };

    // Set remote description and create answer
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    // Send answer
    this.ws?.send(JSON.stringify({
      type: 'answer',
      streamId: this.streamId,
      userId: this.userId,
      data: answer,
    }));
  }

  stop() {
    this.ws?.send(JSON.stringify({
      type: 'leave',
      streamId: this.streamId,
      userId: this.userId,
    }));
    
    this.pc?.close();
    this.ws?.close();
  }
}
