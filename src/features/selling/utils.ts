export const MAX_WORDS = 35;
export const steps = ['Datos', 'Fotos', 'Documentos', 'Confirmar'];

export const categoryOptions = [
  { value: 'obra_arte', label: 'Obras de arte', description: 'Pinturas, esculturas y diseños autorales', icon: 'color-palette-outline' as const },
  { value: 'objeto_disenador', label: 'Objetos de diseñador', description: 'Muebles, accesorios y piezas exclusivas', icon: 'diamond-outline' as const },
  { value: 'otro', label: 'Otros', description: 'Juegos, sets, joyas y más', icon: 'cube-outline' as const },
] as const;

export function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export function limitWords(text: string) {
  const words = text.split(/\s+/);
  if (words.length <= MAX_WORDS) return text;
  return words.slice(0, MAX_WORDS).join(' ');
}
