import { useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import styles from './TabBar.module.css'

interface Props {
  onNewTab: () => void
  onOpenFile: () => void
  onSave: () => void
}

export default function TabBar({ onNewTab, onOpenFile, onSave }: Props) {
  const { tabs, activeTabId, closeTab, setActiveTab } = useEditorStore()

  function handleTabClick(id: string) {
    setActiveTab(id)
  }

  function handleTabClose(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    closeTab(id)
  }

  function handleTabMiddleClick(e: React.MouseEvent, id: string) {
    if (e.button === 1) {
      e.preventDefault()
      closeTab(id)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      onSave()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      onNewTab()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault()
      onOpenFile()
    }
  }

  return (
    <div className={styles.tabBar} onKeyDown={handleKeyDown}>
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const isDirty = tab.content !== tab.savedContent
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.id)}
              onMouseDown={(e) => handleTabMiddleClick(e, tab.id)}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleTabClick(tab.id)}
            >
              <span className={styles.tabTitle}>{tab.title}</span>
              {isDirty && <span className={styles.dirtyDot} title="Unsaved changes" />}
              <button
                className={styles.closeBtn}
                onClick={(e) => handleTabClose(e, tab.id)}
                title="Close tab"
                aria-label={`Close ${tab.title}`}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
      <div className={styles.actions}>
        <button id="btn-new-tab" className={styles.iconBtn} onClick={onNewTab} title="New File (Ctrl+N)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <button id="btn-open-file" className={styles.iconBtn} onClick={onOpenFile} title="Open File (Ctrl+O)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4C2 3.44772 2.44772 3 3 3H5.58579L7 4.41421H11C11.5523 4.41421 12 4.86193 12 5.41421V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
