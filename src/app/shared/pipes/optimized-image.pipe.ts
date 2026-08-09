import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'optimizedImage', standalone: true })
export class OptimizedImagePipe implements PipeTransform {
  transform(url: string | null | undefined, width: number): string {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url ?? '';
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
}
