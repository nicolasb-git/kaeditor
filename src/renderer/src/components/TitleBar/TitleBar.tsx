import { useState, useEffect } from 'react'
import styles from './TitleBar.module.css'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (!window.api) return
    window.api.window.onMaximized((val) => setIsMaximized(val))
  }, [])

  return (
    <div className={styles.titleBar}>
      <div className={styles.drag} />
      <span className={styles.title}>Kaeditor</span>
      <div className={styles.windowControls}>
        <button
          id="btn-minimize"
          className={`${styles.windowBtn} ${styles.minimize}`}
          onClick={() => window.api?.window.minimize()}
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
            <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <button
          id="btn-maximize"
          className={`${styles.windowBtn} ${styles.maximize}`}
          onClick={() => window.api?.window.maximize()}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3 1H9V7M1 3H7V9H1V3Z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </button>
        <button
          id="btn-close"
          className={`${styles.windowBtn} ${styles.close}`}
          onClick={() => window.api?.window.close()}
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
