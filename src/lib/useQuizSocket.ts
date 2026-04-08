import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { buildWsUrl, type LeaderboardEntry } from './api'

type ServerMessage = { type: string } & Record<string, unknown>

type ClientAnswer = { type: 'answer'; answer: string }

export type QuizSocketState = {
  connected: boolean
  questionText: string
  leaderboard: LeaderboardEntry[]
  lastResult?: { correct: boolean; youWon: boolean }
  lastError?: string
  winnerUsername?: string
  winnerOpen: boolean
  closeReason?: string
}

export function useQuizSocket(username: string | null) {
  const [state, setState] = useState<QuizSocketState>({
    connected: false,
    questionText: '',
    leaderboard: [],
    winnerOpen: false,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const tearingDownRef = useRef(false)
  const usernameRef = useRef(username)
  usernameRef.current = username

  const wsUrl = useMemo(() => {
    if (!username) return null
    return buildWsUrl(username)
  }, [username])

  const sendAnswer = useCallback((answer: string) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const payload: ClientAnswer = { type: 'answer', answer }
    ws.send(JSON.stringify(payload))
  }, [])

  const close = useCallback(() => {
    wsRef.current?.close()
  }, [])

  useEffect(() => {
    if (!wsUrl || !username) return

    tearingDownRef.current = false
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    setState((s) => ({
      ...s,
      connected: false,
      lastError: undefined,
      closeReason: undefined,
    }))

    ws.onopen = () => {
      setState((s) => ({
        ...s,
        connected: true,
        lastError: undefined,
        closeReason: undefined,
      }))
    }

    ws.onmessage = (evt) => {
      let msg: ServerMessage
      try {
        msg = JSON.parse(evt.data) as ServerMessage
      } catch {
        setState((s) => ({ ...s, lastError: 'Invalid server message' }))
        return
      }

      if (msg.type === 'question') {
        const text = typeof msg.text === 'string' ? msg.text : ''
        setState((s) => ({ ...s, questionText: text }))
        return
      }
      if (msg.type === 'winner') {
        const winner = typeof msg.winner_username === 'string' ? msg.winner_username : undefined
        setState((s) => ({
          ...s,
          winnerUsername: winner,
          winnerOpen: true,
        }))
        return
      }
      if (msg.type === 'leaderboard') {
        const top = Array.isArray(msg.top) ? (msg.top as LeaderboardEntry[]) : []
        setState((s) => ({ ...s, leaderboard: top }))
        return
      }
      if (msg.type === 'result') {
        const correct = typeof msg.correct === 'boolean' ? msg.correct : false
        const youWon = typeof msg.you_won === 'boolean' ? msg.you_won : false
        setState((s) => ({
          ...s,
          lastResult: { correct, youWon },
        }))
        return
      }
      if (msg.type === 'error') {
        const message = typeof msg.message === 'string' ? msg.message : 'Error'
        setState((s) => ({ ...s, lastError: message }))
        return
      }
    }

    ws.onclose = (evt) => {
      if (tearingDownRef.current) return
      setState((s) => ({
        ...s,
        connected: false,
        closeReason: evt.reason || `Closed (${evt.code})`,
      }))
    }

    ws.onerror = () => {
      // Browsers often emit onerror during a normal page reload / navigation teardown.
      if (tearingDownRef.current) return
      // Some browsers also fire onerror when the socket is already closing/closed.
      if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) return
      setState((s) => ({ ...s, lastError: 'WebSocket error' }))
    }

    return () => {
      tearingDownRef.current = true
      ws.close()
      if (wsRef.current === ws) wsRef.current = null
    }
  }, [wsUrl, username])

  const dismissWinner = useCallback(() => {
    setState((s) => ({ ...s, winnerOpen: false }))
  }, [])

  return { state, sendAnswer, dismissWinner, close }
}

