import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value?.trim()) return '';

    const lines = value.replace(/\r\n/g, '\n').split('\n');
    const html: string[] = [];
    let listType: 'ol' | 'ul' | null = null;

    const closeList = () => {
      if (listType) html.push(`</${listType}>`);
      listType = null;
    };

    for (const line of lines) {
      const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (unordered || ordered) {
        const nextListType = unordered ? 'ul' : 'ol';
        if (listType && listType !== nextListType) closeList();
        if (!listType) {
          listType = nextListType;
          html.push(`<${listType}>`);
        }
        html.push(`<li>${this.inline(unordered?.[1] ?? ordered![1])}</li>`);
        continue;
      }

      closeList();
      if (!line.trim()) continue;
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        html.push(`<h${level}>${this.inline(heading[2])}</h${level}>`);
      } else {
        html.push(`<p>${this.inline(line)}</p>`);
      }
    }
    closeList();
    return html.join('');
  }

  private inline(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return escaped
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_match, label: string, url: string) => `<a href="${this.safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  }

  private safeUrl(url: string): string {
    return /^(https?:\/\/|mailto:|\/|#)/i.test(url) ? url : '#';
  }
}
