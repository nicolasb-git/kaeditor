import { useEditorStore } from '../../store/editorStore'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { sidebarOpen, openFolderPath } = useEditorStore()

  if (!sidebarOpen) return null

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>EXPLORER</span>
      </div>
      <div className={styles.content}>
        {openFolderPath ? (
          <div className={styles.folderName}>{openFolderPath.split(/[\\/]/).pop()}</div>
        ) : (
          <div className={styles.empty}>
            <p>No folder opened</p>
            <button
              id="btn-open-folder"
              className={styles.openBtn}
              onClick={() => window.api.folder.open().then((p) => {
                if (p) useEditorStore.getState().setOpenFolderPath(p)
              })}
            >
              Open Folder
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
