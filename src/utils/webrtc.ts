import { supabase } from '@/integrations/supabase/client';

export class WebRTCBroadcaster {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private channel: ReturnType<typeof supabase.channel> | null = null;
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
    
    console.log('Broadcaster starting with stream:', stream.id);
    console.log('Tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    
    // Use Supabase Realtime for signaling
    this.channel = supabase.channel(`stream-${this.streamId}`, {
      config: { broadcast: { self: false } }
    });

    this.channel
      .on('broadcast', { event: 'viewer-joined' }, async (payload) => {
        const viewerId = payload.payload.viewerId;
        console.log('Viewer joined:', viewerId);
        this.onViewerCountChange?.(this.peerConnections.size + 1);
        await this.createOfferForViewer(viewerId);
      })
      .on('broadcast', { event: 'answer' }, async (payload) => {
        const { viewerId, answer } = payload.payload;
        console.log('Received answer from viewer:', viewerId);
        const pc = this.peerConnections.get(viewerId);
        if (pc && answer) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Set remote description for viewer:', viewerId);
        }
      })
      .on('broadcast', { event: 'ice-candidate-viewer' }, async (payload) => {
        const { viewerId, candidate } = payload.payload;
        const pc = this.peerConnections.get(viewerId);
        if (pc && candidate) {
          console.log('Adding ICE candidate from viewer:', viewerId);
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
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

    await this.channel.subscribe((status) => {
      console.log('Broadcaster channel status:', status);
    });

    // Announce broadcaster is ready
    await this.channel.send({
      type: 'broadcast',
      event: 'broadcaster-ready',
      payload: { broadcasterId: this.userId }
    });

    console.log('Broadcaster started successfully');
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
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
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

  constructor(streamId: string, viewerId: string, onStream?: (stream: MediaStream) => void) {
    this.streamId = streamId;
    this.viewerId = viewerId;
    this.onStream = onStream;
  }

  async start() {
    console.log('Viewer starting for stream:', this.streamId);
    
    // Use Supabase Realtime for signaling
    this.channel = supabase.channel(`stream-${this.streamId}`, {
      config: { broadcast: { self: false } }
    });

    this.channel
      .on('broadcast', { event: 'broadcaster-ready' }, (payload) => {
        console.log('Broadcaster ready:', payload.payload.broadcasterId);
        this.broadcasterId = payload.payload.broadcasterId;
        // Re-announce viewer when broadcaster becomes ready
        this.announceViewer();
      })
      .on('broadcast', { event: 'offer' }, async (payload) => {
        const { viewerId, offer } = payload.payload;
        // Only handle offers meant for this viewer
        if (viewerId === this.viewerId && offer) {
          console.log('Received offer for this viewer');
          this.hasReceivedOffer = true;
          this.stopRetrying();
          await this.handleOffer(offer);
        }
      })
      .on('broadcast', { event: 'ice-candidate-broadcaster' }, async (payload) => {
        const { viewerId, candidate } = payload.payload;
        // Only handle candidates meant for this viewer
        if (viewerId === this.viewerId && this.pc && candidate) {
          console.log('Adding ICE candidate from broadcaster');
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      })
      .on('broadcast', { event: 'broadcaster-stopped' }, () => {
        console.log('Broadcaster stopped');
        this.stop();
      });

    await this.channel.subscribe((status) => {
      console.log('Viewer channel status:', status);
      if (status === 'SUBSCRIBED') {
        // Announce viewer and start retry mechanism
        this.announceViewer();
        this.startRetrying();
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
