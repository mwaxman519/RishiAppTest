import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import path from "path"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export docs directory function for docs API
export function getDocsDirectory(): string {
  return path.join(process.cwd(), 'Docs');
}

// Extract first paragraph from content for documentation previews
export function extractFirstParagraph(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Remove frontmatter if present
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');
  
  // Split by double newlines to get paragraphs
  const paragraphs = withoutFrontmatter.split(/\n\s*\n/);
  
  // Find first non-empty paragraph that's not just markdown syntax
  for (const paragraph of paragraphs) {
    const cleaned = paragraph
      .replace(/^#+\s+/, '') // Remove headers
      .replace(/^\*\s+/, '') // Remove bullet points
      .replace(/^\d+\.\s+/, '') // Remove numbered lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .trim();
    
    if (cleaned && cleaned.length > 20) {
      return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
    }
  }
  
  return '';
}

/**
 * Format Zod validation errors for user display
 */
export function formatZodError(error: any): string {
  if (!error?.errors) {
    return 'Validation error occurred';
  }
  
  return error.errors
    .map((err: any) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
}