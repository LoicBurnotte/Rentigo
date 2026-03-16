'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  label?: string
  error?: string
  maxLength?: number
  className?: string
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // keep editor focus
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
        active
          ? 'bg-emerald-100 text-emerald-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        disabled && 'cursor-not-allowed opacity-30',
      )}>
      {children}
    </button>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-gray-200" />
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RichTextEditor({
  value = '',
  onChange,
  placeholder,
  label,
  error,
  maxLength = 2000,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write a description…',
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0 before:pointer-events-none',
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    immediatelyRender: false, // SSR-safe
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-emerald max-w-none min-h-[140px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      const html = editor.isEmpty ? '' : editor.getHTML()
      onChange?.(html)
    },
  })

  // Sync external value (e.g. edit page sets default values)
  useEffect(() => {
    if (!editor) return
    if (value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  const count = editor.storage.characterCount.characters() as number
  const isNearLimit = count > maxLength * 0.85

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div
        className={cn(
          'overflow-hidden rounded-lg border bg-white shadow-sm transition-colors',
          error ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500',
        )}>
        {/* ── Toolbar ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
          {/* History */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo">
            <Undo size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo">
            <Redo size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2">
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3">
            <Heading3 size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Marks */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold">
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic">
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough">
            <Strikethrough size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet list">
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered list">
            <ListOrdered size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Blockquote">
            <Quote size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule">
            <Minus size={14} />
          </ToolbarButton>
        </div>

        {/* ── Editor area ────────────────────────────────── */}
        <EditorContent editor={editor} />

        {/* ── Footer: char count ─────────────────────────── */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-3 py-1">
          <span
            className={cn(
              'text-xs tabular-nums',
              isNearLimit ? 'text-amber-500' : 'text-gray-400',
              count >= maxLength && 'text-red-500 font-medium',
            )}>
            {count} / {maxLength}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
