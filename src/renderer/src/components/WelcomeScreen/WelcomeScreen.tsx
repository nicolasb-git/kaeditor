import styles from './WelcomeScreen.module.css'

interface Props {
  onNewFile: () => void
  onOpenFile: () => void
}

export default function WelcomeScreen({ onNewFile, onOpenFile }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="url(#grad)" />
            <path d="M16 20H36M16 28H44M16 36H32M16 44H40" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="48" cy="44" r="10" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2" />
            <path d="M45 44L48 47L52 41" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0%" stopColor="#1f6feb" />
                <stop offset="100%" stopColor="#388bfd" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.appName}>Kaeditor</h1>
        <p className={styles.tagline}>A fast, minimal local text editor</p>

        <div className={styles.actions}>
          <button id="btn-welcome-new" className={styles.primaryBtn} onClick={onNewFile}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New File
          </button>
          <button id="btn-welcome-open" className={styles.secondaryBtn} onClick={onOpenFile}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 5C2 4.44772 2.44772 4 3 4H6.58579L8 5.41421H13C13.5523 5.41421 14 5.86193 14 6.41421V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V5Z" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Open File
          </button>
        </div>

        <div className={styles.shortcuts}>
          <div className={styles.shortcutRow}>
            <kbd>Ctrl</kbd><span>+</span><kbd>N</kbd>
            <span className={styles.shortcutLabel}>New file</span>
          </div>
          <div className={styles.shortcutRow}>
            <kbd>Ctrl</kbd><span>+</span><kbd>O</kbd>
            <span className={styles.shortcutLabel}>Open file</span>
          </div>
          <div className={styles.shortcutRow}>
            <kbd>Ctrl</kbd><span>+</span><kbd>S</kbd>
            <span className={styles.shortcutLabel}>Save</span>
          </div>
          <div className={styles.shortcutRow}>
            <kbd>Ctrl</kbd><span>+</span><kbd>B</kbd>
            <span className={styles.shortcutLabel}>Toggle sidebar</span>
          </div>
        </div>
      </div>
    </div>
  )
}
