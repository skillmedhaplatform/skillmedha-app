
import { NextResponse } from "next/server"
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand
} from "@aws-sdk/client-transcribe-streaming"

export const runtime = "nodejs"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY 

const MAX_FRAME_SIZE = 4000

export async function POST(request) {
  let client

  try {
    client = new TranscribeStreamingClient({
      region: "ap-south-1",
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      },
      requestHandler: {
        timeoutInMs: 10000
      }
    })

    const { audioChunk } = await request.json()
    const fullBuffer = Buffer.from(audioChunk)

    const chunks = []
    for (let i = 0; i < fullBuffer.length; i += MAX_FRAME_SIZE) {
      chunks.push(fullBuffer.slice(i, i + MAX_FRAME_SIZE))
    }

    const audioStream = {
      async *[Symbol.asyncIterator]() {
        try {
          for (const chunk of chunks) {
            yield {
              AudioEvent: {
                AudioChunk: chunk
              }
            }
          }
        } catch (err) {
          console.error("Error in audio stream generator:", err)
          throw err
        }
      }
    }

    const command = new StartStreamTranscriptionCommand({
      LanguageCode: "en-US",
      MediaEncoding: "pcm",
      MediaSampleRateHertz: 16000,
      AudioStream: audioStream
    })

    const response = await client.send(command)
    let transcriptResult = ""

    if (response.TranscriptResultStream) {
      try {
        for await (const event of response.TranscriptResultStream) {
          if (event.TranscriptEvent?.Transcript?.Results?.[0]) {
            const result = event.TranscriptEvent.Transcript.Results[0]
            if (result.Alternatives?.[0]?.Transcript) {
              transcriptResult = result.Alternatives[0].Transcript
            }
          }
        }
      } catch (streamError) {
        console.error("Error processing transcript stream:", streamError)
        if (transcriptResult) {
          return NextResponse.json({ transcript: transcriptResult })
        }
        throw streamError
      }
    }

    return NextResponse.json({ transcript: transcriptResult })
  } catch (error) {
    console.error("Error in transcription:", error)
    return NextResponse.json(
      {
        transcript: "",
        status: "warning",
        message: "Could not transcribe audio."
      },
      { status: 200 }
    )
  } finally {
    if (client) {
      try {
        await client.destroy()
      } catch (destroyError) {
        console.error("Error destroying client:", destroyError)
      }
    }
  }
}
