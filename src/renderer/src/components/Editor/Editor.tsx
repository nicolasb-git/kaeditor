import { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from '@codemirror/view'
import { EditorState as CMEditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language'
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
  const { tabs, activeTabId, updateContent, wordWrap, fontSize } = useEditorStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const activeTabIdRef = useRef(activeTabId)

  activeTabIdRef.current = activeTabId

  const saveKeymap = keymap.of([
    {
      key: 'Ctrl-s',
      mac: 'Cmd-s',
      run: () => { onSave(); return true }
    }
  ])

  // Create the editor once
  useEffect(() => {
    if (!containerRef.current) return

    const startContent = activeTab?.content ?? ''
    const startLanguage = activeTab?.language ?? 'text'

    const state = CMEditorState.create({
      doc: startContent,
      extensions: [
        // Base setup
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

        // Syntax highlighting
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

        // Theme
        oneDark,

        // Keymaps
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab
        ]),
        saveKeymap,

        // Compartments for dynamic config
        languageCompartment.of(getLanguageExtension(startLanguage)),
        wordWrapCompartment.of(wordWrap ? EditorView.lineWrapping : []),

        // Listen for changes
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const id = activeTabIdRef.current
            if (id) updateContent(id, update.state.doc.toString())
          }
        }),

        // Base theme tweaks
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
          '.cm-content': {
            caretColor: '#58a6ff',
            padding: '4px 0'
          },
          '.cm-gutters': {
            backgroundColor: '#0d1117',
            borderRight: '1px solid #21262d',
            color: '#6e7681'
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#161b22',
            color: '#e6edf3'
          },
          '.cm-cursor': {
            borderLeftColor: '#58a6ff',
            borderLeftWidth: '2px'
          }
        })
      ]
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // Create once

  // When the active tab changes, update the editor content + language
  useEffect(() => {
    const view = viewRef.current
    if (!view || !activeTab) return

    const currentDoc = view.state.doc.toString()
    if (currentDoc !== activeTab.content) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: activeTab.content }
      })
    }

    // Update language
    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(activeTab.language))
    })
  }, [activeTabId])

  // Update word wrap
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: wordWrapCompartment.reconfigure(wordWrap ? EditorView.lineWrapping : [])
    })
  }, [wordWrap])

  if (!activeTab) return null

  return (
    <div className={styles.editorWrapper} style={{ fontSize: `${fontSize}px` }}>
      <div ref={containerRef} className={`${styles.editorContainer} editor-content`} />
    </div>
  )
}
