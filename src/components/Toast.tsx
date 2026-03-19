import { useEffect, useState, useCallback } from 'react'

let showToastFn: ((msg: string) => void) | null = null

export function useToast() {
  const show = useCallback((msg: string) => {
    showToastFn?.(msg)
  }, [])
  return { show }
}

export function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    showToastFn = (msg: string) => {
      setMessage(msg)
      setVisible(true)
      setTimeout(() => setVisible(false), 2500)
    }
    return () => { showToastFn = null }
  }, [])

  return (
    <div className={`toast ${visible ? 'toast--visible' : ''}`}>
      {message}
    </div>
  )
}
