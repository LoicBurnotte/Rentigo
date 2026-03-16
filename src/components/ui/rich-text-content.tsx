import { cn } from '@/lib/utils'

interface RichTextContentProps {
  html: string
  className?: string
}

/**
 * Read-only renderer for TipTap HTML output.
 * Uses Tailwind Typography prose styles — no JS needed, pure CSS.
 */
export function RichTextContent({ html, className }: RichTextContentProps) {
  if (!html) return null

  return (
    <div
      className={cn(
        'prose prose-sm prose-gray max-w-none',
        // Tune default typography for the card context
        'prose-headings:font-semibold prose-headings:text-gray-900',
        'prose-p:text-gray-600 prose-p:leading-relaxed',
        'prose-li:text-gray-600',
        'prose-strong:text-gray-800',
        'prose-blockquote:border-emerald-400 prose-blockquote:text-gray-500',
        'prose-hr:border-gray-200',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
