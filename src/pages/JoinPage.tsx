import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material'

type LocationState = { error?: string } | null

export function JoinPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState) || null

  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(state?.error || null)

  const trimmed = useMemo(() => username.trim(), [username])

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 'min(520px, 100%)',
          p: 3,
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Competitive Math Quiz
            </Typography>
            <Typography variant="body1">
              Enter a username to join the global room.
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ border: '1px solid', borderColor: 'divider' }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (error) setError(null)
            }}
            slotProps={{ htmlInput: { maxLength: 64 } }}
            autoFocus
            fullWidth
          />

          <Button
            variant="contained"
            disabled={!trimmed || trimmed.length > 64}
            onClick={() => {
              const u = trimmed
              if (!u) return
              navigate('/play', { state: { username: u } })
            }}
          >
            Enter quiz
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

