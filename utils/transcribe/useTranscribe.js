"use client"

import MicrophoneStream from "microphone-stream"
import { useState, useRef } from "react"

const pcmEncodeChunk = chunk => {
  const input = MicrophoneStream.toRaw(chunk)
  const buffer = new ArrayBuffer(input.length * 2)
  const view = new DataView(buffer)
  input.forEach((n, i) => {
    const s = Math.max(-1, Math.min(1, n))
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  })
  return Buffer.from(buffer)
}

const useTranscribe = () => {
  const [transcripts, setTranscripts] = useState([])
  const [recording, setRecording] = useState(false)
  const socketRef = useRef(null)
  const micStreamRef = useRef(null)

  const startTranscription = async () => {
    const socket = new WebSocket("ws://localhost:8080") // Replace with your actual host
    socketRef.current = socket

    socket.onmessage = event => {
      const { transcript } = JSON.parse(event.data)
      if (transcript) {
        setTranscripts(prev => [...prev, transcript])
      }
    }

    socket.onopen = async () => {
      const micStream = new MicrophoneStream()
      micStreamRef.current = micStream

      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      })
      micStream.setStream(stream)

      micStream.on("data", chunk => {
        const pcmChunk = pcmEncodeChunk(chunk)
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(pcmChunk)
        }
      })

      setRecording(true)
    }

    socket.onerror = err => {
      console.error("WebSocket error:", err)
    }
  }

  const stopTranscription = () => {
    socketRef.current?.close()
    micStreamRef.current?.stop()
    setRecording(false)
  }

  const resetTranscripts = () => {
    setTranscripts([])
  }

  return {
    transcripts,
    recording,
    startTranscription,
    stopTranscription,
    resetTranscripts
  }
}

export default useTranscribe
