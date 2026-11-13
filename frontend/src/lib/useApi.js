import { useCallback, useEffect, useState } from 'react'

/** Ambil data dari API dengan status loading/error dan fungsi reload. */
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps)

  const load = useCallback(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    run()
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }))
    return () => { alive = false }
  }, [run])

  useEffect(() => load(), [load])
  return { ...state, reload: load }
}
