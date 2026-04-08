import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'

import { fetchLeaderboard } from '../lib/api'
import { useQuizSocket } from '../lib/useQuizSocket'

type LocationState = { username?: string } | null

export function PlayPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState) || null
  const username = state?.username?.trim() || null

  const { state: wsState, sendAnswer, dismissWinner, close } = useQuizSocket(username)

  const [answer, setAnswer] = useState('')
  const [snack, setSnack] = useState<string | null>(null)
  const [sidebarTop, setSidebarTop] = useState(wsState.leaderboard)
  const abortRef = useRef<AbortController | null>(null)

  const effectiveLeaderboard = useMemo(() => {
    return wsState.leaderboard.length ? wsState.leaderboard : sidebarTop
  }, [wsState.leaderboard, sidebarTop])

  useEffect(() => {
    if (!username) {
      navigate('/', { replace: true })
      return
    }

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    fetchLeaderboard(ac.signal)
      .then((top) => setSidebarTop(top))
      .catch(() => {})

    return () => ac.abort()
  }, [navigate, username])

  useEffect(() => {
    if (wsState.lastError) setSnack(wsState.lastError)
  }, [wsState.lastError])

  useEffect(() => {
    if (!username) return
    const reason = (wsState.closeReason || '').toLowerCase()
    const err = (wsState.lastError || '').toLowerCase()
    if (reason.includes('username already taken') || err.includes('username already taken')) {
      close()
      navigate('/join', { replace: true, state: { error: 'Username already taken' } })
    }
  }, [close, navigate, username, wsState.closeReason, wsState.lastError])

  useEffect(() => {
    if (!wsState.lastResult) return
    if (wsState.lastResult.youWon) setSnack('You won!')
    else if (wsState.lastResult.correct) setSnack('Correct, but someone else was first.')
    else setSnack('Incorrect.')
  }, [wsState.lastResult])

  if (!username) return null

  return (
    <Box sx={{ p: 2, height: '100%', boxSizing: 'border-box' }}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Question
              </Typography>
              <Typography variant="body2">You are: {username}</Typography>
            </Box>
            <Typography variant="body2">
              {wsState.connected ? 'Connected' : 'Connecting…'}
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {wsState.questionText || 'Waiting for question…'}
            </Typography>
          </Paper>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <TextField
              label="Your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = answer.trim()
                  if (!v) return
                  sendAnswer(v)
                  setAnswer('')
                }
              }}
              fullWidth
            />
            <Button
              variant="contained"
              disabled={!answer.trim() || !wsState.connected}
              onClick={() => {
                const v = answer.trim()
                if (!v) return
                sendAnswer(v)
                setAnswer('')
              }}
              sx={{ minWidth: 140 }}
            >
              Submit
            </Button>
          </Box>

          {wsState.lastError && !wsState.connected && (
            <Alert severity="error" sx={{ border: '1px solid', borderColor: 'divider' }}>
              {wsState.lastError}
            </Alert>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 360 },
            p: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Leaderboard
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Top 10
          </Typography>
          <Divider sx={{ borderColor: 'divider', mb: 1 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {effectiveLeaderboard.map((e, idx) => (
              <Paper
                key={e.username}
                elevation={0}
                sx={{
                  p: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>
                  {idx + 1}. {e.username}
                </Typography>
                <Typography sx={{ fontWeight: 900 }}>{e.score}</Typography>
              </Paper>
            ))}
            {!effectiveLeaderboard.length && (
              <Typography variant="body2">No scores yet.</Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <Dialog open={wsState.winnerOpen} onClose={dismissWinner} fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Winner</DialogTitle>
        <DialogContent>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {wsState.winnerUsername || 'Someone'} won!
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Next question appears immediately.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={dismissWinner}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={1800}
        onClose={() => setSnack(null)}
        message={snack || ''}
      />
    </Box>
  )
}

