// components/StudentTestInterface.jsx
import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const StudentTestInterface = ({ testData, sessionId, studentId }) => {
  const [agoraClient, setAgoraClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (testData.isLiveProctored || true && sessionId) {
      initializeAgora();
    }
    
    return () => {
      if (agoraClient) {
        agoraClient.leave();
        localVideoTrack?.close();
        localAudioTrack?.close();
      }
    };
  }, [sessionId]);

  const initializeAgora = async () => {
    try {
      console.log('Initializing Agora for student...');
      
      // Get student token (PUBLISHER role)
      const response = await fetch('http://localhost:4334/agora/generate-student-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionId: sessionId.sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to get student token');
      }

      const { appId, channelName, uid, token } = await response.json();
      console.log('Student token received:', { channelName, uid });

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setAgoraClient(client);

      // Join channel
      await client.join(appId, channelName, token, uid);
      console.log('Student joined channel successfully');

      // Create local tracks (student shares video/audio)
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: "480p_1"
      });
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      // Play local video
      videoTrack.play('local-video');

      // Publish tracks (student is publisher)
      await client.publish([videoTrack, audioTrack]);
      console.log('Student published tracks successfully');
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize Agora:', error);
      setIsConnected(false);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  return (
    <div className="student-test-interface">
      {/* Proctoring panel */}
      {testData.isLiveProctored && (
        <div className="proctoring-panel">
          <div className="proctoring-status">
            <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Proctoring Active' : '🔴 Connecting...'}
            </span>
          </div>
          
          <div className="student-video-preview">
            <div 
              id="local-video" 
              style={{ 
                width: '100%', 
                height: '200px', 
                backgroundColor: '#000',
                borderRadius: '8px'
              }}
            ></div>
            
            <div className="video-controls">
              <button 
                onClick={toggleVideo}
                className={`control-btn ${isVideoEnabled ? 'active' : 'inactive'}`}
              >
                {isVideoEnabled ? '📹' : '📷'}
              </button>
              <button 
                onClick={toggleAudio}
                className={`control-btn ${isAudioEnabled ? 'active' : 'inactive'}`}
              >
                {isAudioEnabled ? '🎤' : '🔇'}
              </button>
            </div>
          </div>

          <div className="proctoring-info">
            <p>📹 Your video is being monitored</p>
            <p>🎤 Your audio is being recorded</p>
            <p>⚠️ Do not leave this tab during the exam</p>
          </div>
        </div>
      )}

      {/* Your existing test interface */}
      <div className="test-content">
        <h2>{testData.name}</h2>
        <div className="test-questions">
          {/* Your existing test questions, timer, navigation, etc. */}
          <p>Test questions will appear here...</p>
        </div>
      </div>
    </div>
  );
};

export default StudentTestInterface;
