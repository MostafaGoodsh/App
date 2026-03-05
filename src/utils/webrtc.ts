import { supabase } from '@/integrations/supabase/client';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // Free TURN servers for NAT traversal on mobile networks
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

export class WebRTCBroadcaster {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private localStream: MediaStream | null = null;
  private streamId: string;
  private userId: string;
  private onViewerCountChange?: (count: number) => void;
  private isReady = false;
  private readyAnnounceInterval: NodeJS.Timeout | null = null;

  constructor(streamId: string, userId: string, onViewerCountChange?: (count: number) => void) {
    this.streamId = streamId;
    this.userId = userId;
    this.onViewerCountChange = onViewerCountChange;
  }

  async start(stream: MediaStream) {
    this.localStream = stream;
    
    console.log('Broadcaster starting with stream:', stream.id);
    console.log('Tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    
    // Use Supabase Realtime for signaling - simpler config
    this.channel = supabase.channel(`stream-${this.streamId}`);

    this.channel
      .on('broadcast', { event: 'viewer-joined' }, async (payload) => {
        const viewerId = payload.payload.viewerId;
        console.log('Viewer joined:', viewerId);
        
        // Check if we already have a connection for this viewer
        if (this.peerConnections.has(viewerId)) {
          console.log('Already have connection for viewer, recreating...');
          const oldPc = this.peerConnections.get(viewerId);
          oldPc?.close();
          this.peerConnections.delete(viewerId);
        }
        
        this.onViewerCountChange?.(this.peerConnections.size + 1);
        await this.createOfferForViewer(viewerId);
      })
      .on('broadcast', { event: 'answer' }, async (payload) => {
        const { viewerId, answer } = payload.payload;
        console.log('Received answer from viewer:', viewerId);
        const pc = this.peerConnections.get(viewerId);
        if (pc && answer) {
          try {
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
              console.log('Set remote description for viewer:', viewerId);
            } else {
              console.warn('Wrong signaling state for answer:', pc.signalingState);
            }
          } catch (e) {
            console.error('Error setting remote description:', e);
          }
        }
      })
      .on('broadcast', { event: 'ice-candidate-viewer' }, async (payload) => {
        const { viewerId, candidate } = payload.payload;
        const pc = this.peerConnections.get(viewerId);
        if (pc && candidate && pc.remoteDescription) {
          console.log('Adding ICE candidate from viewer:', viewerId);
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      })
      .on('broadcast', { event: 'viewer-left' }, (payload) => {
        const viewerId = payload.payload.viewerId;
        console.log('Viewer left:', viewerId);
        const pc = this.peerConnections.get(viewerId);
        if (pc) {
          pc.close();
          this.peerConnections.delete(viewerId);
          this.onViewerCountChange?.(this.peerConnections.size);
        }
      });

    const subscribeResult = await this.channel.subscribe((status, err) => {
      console.log('Broadcaster channel status:', status);
      if (err) {
        console.error('Broadcaster channel error:', err);
      }
      if (status === 'SUBSCRIBED') {
        this.isReady = true;
        this.announceReady();
        // Keep announcing periodically so new viewers can find us
        this.readyAnnounceInterval = setInterval(() => {
          this.announceReady();
        }, 3000);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel subscription failed, retrying...');
        // Retry subscription after a short delay
        setTimeout(() => {
          if (this.channel && !this.isReady) {
            this.channel.subscribe();
          }
        }, 2000);
      }
    });

    console.log('Broadcaster subscribe result:', subscribeResult);
    console.log('Broadcaster started successfully');
  }

  private async announceReady() {
    if (!this.channel || !this.isReady) return;
    
    console.log('Announcing broadcaster ready');
    await this.channel.send({
      type: 'broadcast',
      event: 'broadcaster-ready',
      payload: { broadcasterId: this.userId, streamId: this.streamId }
    });
  }

  private async createOfferForViewer(viewerId: string) {
    console.log('Creating offer for viewer:', viewerId);
    
    if (!this.localStream) {
      console.error('No local stream available!');
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    this.peerConnections.set(viewerId, pc);

    // Add local stream tracks
    const tracks = this.localStream.getTracks();
    console.log(`Adding ${tracks.length} tracks to peer connection for viewer ${viewerId}`);
    
    tracks.forEach(track => {
      console.log(`Adding track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      pc.addTrack(track, this.localStream!);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.channel) {
        console.log('Sending ICE candidate to viewer:', viewerId);
        this.channel.send({
          type: 'broadcast',
          event: 'ice-candidate-broadcaster',
          payload: { 
            viewerId, 
            candidate: event.candidate.toJSON() 
          }
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state for viewer', viewerId, ':', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.peerConnections.delete(viewerId);
        this.onViewerCountChange?.(this.peerConnections.size);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state for viewer', viewerId, ':', pc.iceConnectionState);
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    console.log('Sending offer to viewer:', viewerId);
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'offer',
        payload: { 
          viewerId, 
          offer: pc.localDescription?.toJSON() 
        }
      });
    }
  }

  stop() {
    console.log('Stopping broadcaster');
    
    this.isReady = false;
    
    if (this.readyAnnounceInterval) {
      clearInterval(this.readyAnnounceInterval);
      this.readyAnnounceInterval = null;
    }
    
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'broadcaster-stopped',
        payload: { broadcasterId: this.userId }
      });
      supabase.removeChannel(this.channel);
    }
    
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.localStream = null;
    this.channel = null;
  }
}

export class WebRTCViewer {
  private pc: RTCPeerConnection | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private streamId: string;
  private viewerId: string;
  private onStream?: (stream: MediaStream) => void;
  private broadcasterId: string | null = null;
  private retryInterval: NodeJS.Timeout | null = null;
  private hasReceivedOffer = false;
  private pendingCandidates: RTCIceCandidateInit[] = [];

  constructor(streamId: string, viewerId: string, onStream?: (stream: MediaStream) => void) {
    this.streamId = streamId;
    this.viewerId = viewerId;
    this.onStream = onStream;
  }

  async start() {
    console.log('Viewer starting for stream:', this.streamId);
    
    // Use Supabase Realtime for signaling - simpler config
    this.channel = supabase.channel(`stream-${this.streamId}`);

    this.channel
      .on('broadcast', { event: 'broadcaster-ready' }, (payload) => {
        console.log('Broadcaster ready:', payload.payload.broadcasterId);
        this.broadcasterId = payload.payload.broadcasterId;
        // Re-announce viewer when broadcaster becomes ready
        if (!this.hasReceivedOffer) {
          this.announceViewer();
        }
      })
      .on('broadcast', { event: 'offer' }, async (payload) => {
        const { viewerId, offer } = payload.payload;
        // Only handle offers meant for this viewer
        if (viewerId === this.viewerId && offer) {
          console.log('Received offer for this viewer');
          this.hasReceivedOffer = true;
          this.stopRetrying();
          
          // Close existing connection if any
          if (this.pc) {
            this.pc.close();
            this.pc = null;
          }
          
          await this.handleOffer(offer);
        }
      })
      .on('broadcast', { event: 'ice-candidate-broadcaster' }, async (payload) => {
        const { viewerId, candidate } = payload.payload;
        // Only handle candidates meant for this viewer
        if (viewerId === this.viewerId && this.pc && candidate) {
          console.log('Adding ICE candidate from broadcaster');
          try {
            if (this.pc.remoteDescription) {
              await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              console.log('Queuing ICE candidate - no remote description yet');
            }
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      })
      .on('broadcast', { event: 'broadcaster-stopped' }, () => {
        console.log('Broadcaster stopped');
        this.onStream?.(new MediaStream()); // Clear stream
      });

    await this.channel.subscribe((status, err) => {
      console.log('Viewer channel status:', status);
      if (err) {
        console.error('Viewer channel error:', err);
      }
      if (status === 'SUBSCRIBED') {
        // Announce viewer and start retry mechanism
        this.announceViewer();
        this.startRetrying();
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Viewer channel subscription failed, retrying...');
        setTimeout(() => {
          if (this.channel && !this.hasReceivedOffer) {
            this.channel.subscribe();
          }
        }, 2000);
      }
    });

    console.log('Viewer connected, waiting for offer...');
  }

  private async announceViewer() {
    if (!this.channel || this.hasReceivedOffer) return;
    
    console.log('Announcing viewer:', this.viewerId);
    await this.channel.send({
      type: 'broadcast',
      event: 'viewer-joined',
      payload: { viewerId: this.viewerId }
    });
  }

  private startRetrying() {
    // Retry announcing every 2 seconds for up to 30 seconds
    let attempts = 0;
    this.retryInterval = setInterval(() => {
      attempts++;
      if (attempts > 15 || this.hasReceivedOffer) {
        this.stopRetrying();
        return;
      }
      console.log('Retrying viewer announcement, attempt:', attempts);
      this.announceViewer();
    }, 2000);
  }

  private stopRetrying() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    console.log('Handling offer from broadcaster');
    
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });

    // Handle incoming stream
    this.pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log('Remote stream received with', stream.getTracks().length, 'tracks');
        this.onStream?.(stream);
      }
    };

    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.channel) {
        console.log('Sending ICE candidate to broadcaster');
        this.channel.send({
          type: 'broadcast',
          event: 'ice-candidate-viewer',
          payload: { 
            viewerId: this.viewerId, 
            candidate: event.candidate.toJSON() 
          }
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log('Viewer connection state:', this.pc?.connectionState);
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log('Viewer ICE connection state:', this.pc?.iceConnectionState);
    };

    // Set remote description and create answer
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    // Send answer
    console.log('Sending answer to broadcaster');
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'answer',
        payload: { 
          viewerId: this.viewerId, 
          answer: this.pc.localDescription?.toJSON() 
        }
      });
    }
  }

  stop() {
    console.log('Stopping viewer');
    
    this.stopRetrying();
    
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'viewer-left',
        payload: { viewerId: this.viewerId }
      });
      supabase.removeChannel(this.channel);
    }
    
    this.pc?.close();
    this.pc = null;
    this.channel = null;
  }
}
