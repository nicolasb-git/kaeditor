import { useEditorStore } from '../../store/editorStore'
import styles from './StatusBar.module.css'

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript',
  python: 'Python', html: 'HTML', css: 'CSS',
  json: 'JSON', markdown: 'Markdown', rust: 'Rust',
  java: 'Java', cpp: 'C++', c: 'C', sql: 'SQL',
  xml: 'XML', yaml: 'YAML', text: 'Plain Text'
}

export default function StatusBar() {
  const { tabs, activeTabId, wordWrap, fontSize, setFontSize } = useEditorStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const isDirty = activeTab ? activeTab.content !== activeTab.savedContent : false
  const language = activeTab ? (LANGUAGE_LABELS[activeTab.language] ?? activeTab.language) : '—'
  const filePath = activeTab?.filePath ?? null

  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        {filePath && (
          <span className={styles.item} title={filePath}>
            {filePath}
          </span>
        )}
        {isDirty && <span className={`${styles.item} ${styles.dirty}`}>● Unsaved</span>}
      </div>
      <div className={styles.right}>
        <span className={styles.item}>{language}</span>
        <span className={styles.divider} />
        <span className={styles.item}>UTF-8</span>
        <span className={styles.divider} />
        <span className={styles.item}>{wordWrap ? 'Word Wrap: On' : 'Word Wrap: Off'}</span>
        <span className={styles.divider} />
        <button
          id="btn-decrease-font"
          className={styles.fontBtn}
          onClick={() => setFontSize(Math.max(10, fontSize - 1))}
          title="Decrease font size"
        >−</button>
        <span className={styles.item}>{fontSize}px</span>
        <button
          id="btn-increase-font"
          className={styles.fontBtn}
          onClick={() => setFontSize(Math.min(24, fontSize + 1))}
          title="Increase font size"
        >+</button>
      </div>
    </div>
  )
}
