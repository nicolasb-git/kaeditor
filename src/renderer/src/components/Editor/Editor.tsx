import { useEffect, useRef } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from '@codemirror/view'
import { EditorState as CMEditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches, openSearchPanel, gotoLine } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap, indentUnit } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { rust } from '@codemirror/lang-rust'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { sql } from '@codemirror/lang-sql'
import { xml } from '@codemirror/lang-xml'
import { oneDark } from '@codemirror/theme-one-dark'
import { useEditorStore } from '../../store/editorStore'
import styles from './Editor.module.css'

const languageCompartment = new Compartment()
const wordWrapCompartment = new Compartment()
const indentCompartment = new Compartment()

function getLanguageExtension(language: string) {
  switch (language) {
    case 'javascript':
    case 'typescript': return javascript({ typescript: language === 'typescript' })
    case 'python': return python()
    case 'html': return html()
    case 'css': return css()
    case 'json': return json()
    case 'markdown': return markdown()
    case 'rust': return rust()
    case 'java': return java()
    case 'cpp':
    case 'c': return cpp()
    case 'sql': return sql()
    case 'xml': return xml()
    default: return []
  }
}

interface Props {
  onSave: () => void
}

export default function Editor({ onSave }: Props) {
  const { tabs, activeTabId, updateContent, wordWrap, fontSize, settings } = useEditorStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const activeTabIdRef = useRef(activeTabId)

  activeTabIdRef.current = activeTabId

  // Listen to menu events for Search, Go to Line and Save
  useEffect(() => {
    if (!window.api) return
    const unsubs = [
      window.api.menu.onFind(() => viewRef.current?.focus() || openSearchPanel(viewRef.current!)),
      window.api.menu.onGotoLine(() => viewRef.current?.focus() || gotoLine(viewRef.current!))
    ]
    return () => unsubs.forEach(u => u())
  }, [])

  // Create the editor once
  useEffect(() => {
    if (!containerRef.current) return

    const startContent = activeTab?.content ?? ''
    const startLanguage = activeTab?.language ?? 'text'

    const state = CMEditorState.create({
      doc: startContent,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        foldGutter(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightSelectionMatches(),
        autocompletion(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        oneDark,

        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab
        ]),
        keymap.of([
          {
            key: 'Ctrl-g',
            mac: 'Cmd-g',
            run: (view) => { gotoLine(view); return true }
          }
        ]),

        languageCompartment.of(getLanguageExtension(startLanguage)),
        wordWrapCompartment.of(wordWrap ? EditorView.lineWrapping : []),
        indentCompartment.of(indentUnit.of(settings.insertSpaces ? " ".repeat(settings.tabSize) : "\t")),

        EditorView.updateListener.of((update) => {
          const id = activeTabIdRef.current
          if (!id || !viewRef.current) return

          const content = update.state.doc.toString()
          const cursor = update.state.selection.main.head
          const scroll = {
            top: viewRef.current.scrollDOM.scrollTop,
            left: viewRef.current.scrollDOM.scrollLeft
          }

          const currentTab = useEditorStore.getState().tabs.find(t => t.id === id)
          if (!currentTab) return

          // Only update if something actually changed
          if (
            update.docChanged || 
            currentTab.cursorOffset !== cursor || 
            currentTab.scrollPosition.top !== scroll.top || 
            currentTab.scrollPosition.left !== scroll.left
          ) {
            updateContent(id, content, cursor, scroll)
          }
        }),

        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: `${fontSize}px`,
            fontFamily: 'var(--font-mono)'
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'var(--font-mono)'
          },
          '.cm-content': { caretColor: '#58a6ff', padding: '4px 0' },
          '.cm-gutters': {
            backgroundColor: '#0d1117',
            borderRight: '1px solid #21262d',
            color: '#6e7681'
          },
          '.cm-activeLineGutter': { backgroundColor: '#161b22', color: '#e6edf3' },
          '.cm-cursor': { borderLeftColor: '#58a6ff', borderLeftWidth: '2px' },
          // Style for search panel
          '.cm-search': {
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-ui)',
            padding: '8px'
          },
          '.cm-search input': {
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px 6px',
            outline: 'none'
          },
          '.cm-search input:focus': { borderColor: 'var(--accent-primary)' },
          '.cm-search button': {
            backgroundColor: 'var(--bg-hover)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            margin: '2px',
            cursor: 'pointer'
          },
          '.cm-search button:hover': { color: 'var(--text-primary)' },
          '.cm-search label': { fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }
        })
      ]
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  // When tab switches: Restore cursor & scroll
  useEffect(() => {
    const view = viewRef.current
    if (!view || !activeTab) return

    const currentDoc = view.state.doc.toString()
    
    // Batch dispatch for performance and to avoid multiple renderers
    view.dispatch({
      changes: currentDoc !== activeTab.content ? { from: 0, to: currentDoc.length, insert: activeTab.content } : undefined,
      selection: { anchor: activeTab.cursorOffset },
      effects: [
         languageCompartment.reconfigure(getLanguageExtension(activeTab.language))
      ]
    })

    // Restore scroll after the layout is calculated
    requestAnimationFrame(() => {
      if (viewRef.current) {
        viewRef.current.scrollDOM.scrollTop = activeTab.scrollPosition.top
        viewRef.current.scrollDOM.scrollLeft = activeTab.scrollPosition.left
      }
    })
  }, [activeTabId])

  // Update dynamic settings
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: [
        wordWrapCompartment.reconfigure(wordWrap ? EditorView.lineWrapping : []),
        indentCompartment.reconfigure(indentUnit.of(settings.insertSpaces ? " ".repeat(settings.tabSize) : "\t"))
      ]
    })
  }, [wordWrap, settings])

  if (!activeTab) return null

  return (
    <div className={styles.editorWrapper} style={{ fontSize: `${fontSize}px` }}>
      <div ref={containerRef} className={`${styles.editorContainer} editor-content`} />
    </div>
  )
}
