import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import styles from './Sidebar.module.css'

interface TreeItemProps {
  node: FileNode
  depth: number
}

function FileTreeItem({ node, depth }: TreeItemProps) {
  const [collapsed, setCollapsed] = useState(true)
  const { openTabs, tabs, activeTabId, setActiveTab } = useEditorStore()

  const handleToggle = async () => {
    if (node.isDirectory) {
      setCollapsed(!collapsed)
    } else {
      // Open file
      const result = await window.api.file.read(node.path)
      if (result.success && result.content !== undefined) {
        openTabs([{ filePath: node.path, content: result.content }])
      }
    }
  }

  const isActive = activeTabId && tabs.find(t => t.id === activeTabId)?.filePath === node.path

  return (
    <div className={styles.treeItemWrapper}>
      <div 
        className={`${styles.treeItem} ${isActive ? styles.active : ''}`} 
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={handleToggle}
      >
        <span className={styles.icon}>
          {node.isDirectory ? (collapsed ? '▸' : '▾') : ''}
        </span>
        <span className={styles.fileName}>{node.name}</span>
      </div>
      {node.isDirectory && !collapsed && node.children && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, openFolderPath, fileTree } = useEditorStore()

  if (!sidebarOpen) return null

  const folderName = openFolderPath ? openFolderPath.split(/[\\/]/).pop() : ''

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>EXPLORER</span>
      </div>
      <div className={styles.content}>
        {openFolderPath ? (
          <div className={styles.treeRoot}>
            <div className={styles.folderName}>{folderName}</div>
            <div className={styles.treeList}>
              {fileTree.map((node) => (
                <FileTreeItem key={node.path} node={node} depth={0} />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No folder opened</p>
            <button 
              className="btn btn-primary"
              onClick={async () => {
                const result = await window.api.folder.open()
                if (result) useEditorStore.getState().setOpenFolderPath(result.path, result.tree)
              }}
            >
              Open Folder
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
