import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export class WebRTCBroadcaster {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private channel: RealtimeChannel | null = null;
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
    
    // Create Realtime channel for signaling
    this.channel = supabase.channel(`stream:${this.streamId}`);

    // Listen for viewer join requests
    this.channel.on('broadcast', { event: 'viewer-join' }, async (payload) => {
      const viewerId = payload.payload.userId;
      console.log('Viewer joined:', viewerId);
      this.onViewerCountChange?.(this.peerConnections.size + 1);
      await this.createOfferForViewer(viewerId);
    });

    // Listen for answers from viewers
    this.channel.on('broadcast', { event: 'answer' }, async (payload) => {
      const { userId: viewerId, answer } = payload.payload;
      console.log('Received answer from viewer:', viewerId);
      const pc = this.peerConnections.get(viewerId);
      if (pc && answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Listen for ICE candidates from viewers
    this.channel.on('broadcast', { event: 'ice-candidate' }, async (payload) => {
      const { userId: viewerId, candidate } = payload.payload;
      const pc = this.peerConnections.get(viewerId);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Subscribe to channel
    await this.channel.subscribe();
    console.log('Broadcaster subscribed to channel');

    // Announce broadcaster is ready
    await this.channel.send({
      type: 'broadcast',
      event: 'broadcaster-ready',
      payload: { userId: this.userId }
    });
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
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to viewer:', viewerId);
        await this.channel?.send({
          type: 'broadcast',
          event: 'offer-ice',
          payload: {
            userId: this.userId,
            toUserId: viewerId,
            candidate: event.candidate
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

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    console.log('Sending offer to viewer:', viewerId);
    await this.channel?.send({
      type: 'broadcast',
      event: 'offer',
      payload: {
        userId: this.userId,
        toUserId: viewerId,
        offer: offer
      }
    });
  }

  stop() {
    console.log('Stopping broadcaster');
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.channel?.unsubscribe();
    this.localStream = null;
  }
}

export class WebRTCViewer {
  private pc: RTCPeerConnection | null = null;
  private channel: RealtimeChannel | null = null;
  private streamId: string;
  private userId: string;
  private broadcasterId: string | null = null;
  private onStream?: (stream: MediaStream) => void;

  constructor(streamId: string, userId: string, onStream?: (stream: MediaStream) => void) {
    this.streamId = streamId;
    this.userId = userId;
    this.onStream = onStream;
  }

  async start() {
    // Create Realtime channel
    this.channel = supabase.channel(`stream:${this.streamId}`);

    // Listen for broadcaster ready
    this.channel.on('broadcast', { event: 'broadcaster-ready' }, async (payload) => {
      this.broadcasterId = payload.payload.userId;
      console.log('Broadcaster is ready:', this.broadcasterId);
      
      // Request to join
      await this.channel?.send({
        type: 'broadcast',
        event: 'viewer-join',
        payload: { userId: this.userId }
      });
    });

    // Listen for offers from broadcaster
    this.channel.on('broadcast', { event: 'offer' }, async (payload) => {
      const { userId: fromUserId, toUserId, offer } = payload.payload;
      console.log('Received offer from broadcaster');
      
      if (toUserId === this.userId && offer) {
        await this.handleOffer(offer, fromUserId);
      }
    });

    // Listen for ICE candidates from broadcaster
    this.channel.on('broadcast', { event: 'offer-ice' }, async (payload) => {
      const { toUserId, candidate } = payload.payload;
      
      if (toUserId === this.userId && this.pc && candidate) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Subscribe to channel
    await this.channel.subscribe();
    console.log('Viewer subscribed to channel');
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, broadcasterId: string) {
    console.log('Handling offer from broadcaster:', broadcasterId);
    this.broadcasterId = broadcasterId;
    
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
    this.pc.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to broadcaster');
        await this.channel?.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            userId: this.userId,
            candidate: event.candidate
          }
        });
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
    await this.channel?.send({
      type: 'broadcast',
      event: 'answer',
      payload: {
        userId: this.userId,
        answer: answer
      }
    });
  }

  stop() {
    console.log('Stopping viewer');
    this.pc?.close();
    this.channel?.unsubscribe();
  }
}
