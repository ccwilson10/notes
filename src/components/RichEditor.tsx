import { useEffect, useState, useCallback } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

type Props = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichEditor({ content, onChange, placeholder = 'Start writing...' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[200px] prose-editor',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? '' : editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="flex-1 flex flex-col">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    editor.on('transaction', handler)
    return () => { editor.off('transaction', handler) }
  }, [editor])

  const btn = useCallback(
    (
      label: string,
      check: () => boolean,
      action: () => void,
      style?: { bold?: boolean; italic?: boolean; strike?: boolean }
    ) => (
      <button
        key={label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={action}
        className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer ${
          check()
            ? 'bg-surface-hover text-text font-medium'
            : 'text-text-secondary hover:bg-surface hover:text-text'
        } ${style?.bold ? 'font-bold' : ''} ${style?.italic ? 'italic' : ''} ${style?.strike ? 'line-through' : ''}`}
      >
        {label}
      </button>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  )

  return (
    <div className="flex items-center gap-0.5 mb-2 flex-wrap bg-surface rounded-md px-1.5 py-1 border border-border">
      {btn('B', () => editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), { bold: true })}
      {btn('I', () => editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), { italic: true })}
      {btn('S', () => editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), { strike: true })}
      <div className="w-px h-4 bg-border mx-1" />
      {btn('H1', () => editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
      {btn('H2', () => editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
      <div className="w-px h-4 bg-border mx-1" />
      {btn('List', () => editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
      {btn('1.', () => editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
      {btn('Quote', () => editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run())}
      {btn('Code', () => editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run())}
    </div>
  )
}
