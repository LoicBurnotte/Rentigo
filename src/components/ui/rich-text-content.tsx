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
        'prose-headings:font-semibold prose-headings:text-text',
        'prose-p:text-text-secondary prose-p:leading-relaxed',
        'prose-li:text-text-secondary',
        'prose-strong:text-gray-800',
        'prose-blockquote:border-orange-400 prose-blockquote:text-text-secondary',
        'prose-hr:border-border',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
