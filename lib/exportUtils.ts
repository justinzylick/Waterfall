import { toBlob, toPng, toSvg } from 'html-to-image';

export interface ExportDarkModeOptions {
  isDarkMode?: boolean;
}

const EXPORT_OPTIONS = {
  backgroundColor: 'rgba(0,0,0,0)',
  pixelRatio: 2,
  style: {
    background: 'transparent',
  },
  filter: (node: HTMLElement) => {
    return !node.classList?.contains('no-export');
  },
};

// Dark → light color mapping for export
const DARK_TO_LIGHT: Record<string, string> = {
  '#F3F4F6': '#1F2937',
  '#E5E7EB': '#6B7280',
  '#D1D5DB': '#6B7280',
  '#4B5563': '#9CA3AF',
};

/**
 * Clone the element, swap dark-mode colors to light-mode on the clone,
 * render offscreen, capture, then remove. Original DOM is never touched.
 */
function createExportClone(element: HTMLElement): { clone: HTMLElement; cleanup: () => void } {
  const clone = element.cloneNode(true) as HTMLElement;

  // Swap SVG text fills
  clone.querySelectorAll('svg text').forEach((el) => {
    const fill = el.getAttribute('fill');
    if (fill && DARK_TO_LIGHT[fill]) {
      el.setAttribute('fill', DARK_TO_LIGHT[fill]);
    }
  });

  // Swap SVG line strokes
  clone.querySelectorAll('svg line').forEach((el) => {
    const stroke = el.getAttribute('stroke');
    if (stroke && DARK_TO_LIGHT[stroke]) {
      el.setAttribute('stroke', DARK_TO_LIGHT[stroke]);
    }
  });

  // Place behind page content — must stay fully opaque for
  // html-to-image to capture it, but visually hidden behind the page
  clone.style.position = 'fixed';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = '-9999';
  document.body.appendChild(clone);

  return {
    clone,
    cleanup: () => clone.remove(),
  };
}

async function getExportElement(
  element: HTMLElement,
  options?: ExportDarkModeOptions
): Promise<{ target: HTMLElement; cleanup: () => void }> {
  if (options?.isDarkMode) {
    const { clone, cleanup } = createExportClone(element);
    return { target: clone, cleanup };
  }
  return { target: element, cleanup: () => {} };
}

export async function copyPngToClipboard(
  element: HTMLElement,
  options?: ExportDarkModeOptions
): Promise<void> {
  const { target, cleanup } = await getExportElement(element, options);
  try {
    const blob = await toBlob(target, EXPORT_OPTIONS);
    if (!blob) throw new Error('Failed to generate image');
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  } catch (err) {
    const blobPromise = toBlob(target, EXPORT_OPTIONS).then((b) => {
      if (!b) throw new Error('Failed to generate image');
      return b;
    });
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blobPromise }),
    ]);
  } finally {
    cleanup();
  }
}

export async function downloadPng(
  element: HTMLElement,
  filename: string = 'cascade-chart.png',
  options?: ExportDarkModeOptions
): Promise<void> {
  const { target, cleanup } = await getExportElement(element, options);
  try {
    const dataUrl = await toPng(target, EXPORT_OPTIONS);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    cleanup();
  }
}

export async function downloadSvg(
  element: HTMLElement,
  filename: string = 'cascade-chart.svg',
  options?: ExportDarkModeOptions
): Promise<void> {
  const { target, cleanup } = await getExportElement(element, options);
  try {
    const dataUrl = await toSvg(target, {
      ...EXPORT_OPTIONS,
      pixelRatio: 1,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    cleanup();
  }
}

export async function downloadPptx(
  element: HTMLElement,
  filename: string = 'cascade-chart.pptx',
  options?: ExportDarkModeOptions
): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const { target, cleanup } = await getExportElement(element, options);

  try {
    const dataUrl = await toPng(target, {
      ...EXPORT_OPTIONS,
      backgroundColor: '#ffffff',
      style: { background: '#ffffff' },
      pixelRatio: 3,
    });

    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'WIDESCREEN', width: 13.33, height: 7.5 });
    pptx.layout = 'WIDESCREEN';

    const slide = pptx.addSlide();

    const slideW = 13.33;
    const slideH = 7.5;
    const padding = 0.5;
    const maxW = slideW - 2 * padding;
    const maxH = slideH - 2 * padding;

    const chartAspect = element.offsetWidth / element.offsetHeight;
    let imgW = maxW;
    let imgH = imgW / chartAspect;
    if (imgH > maxH) {
      imgH = maxH;
      imgW = imgH * chartAspect;
    }

    const imgX = (slideW - imgW) / 2;
    const imgY = (slideH - imgH) / 2;

    slide.addImage({
      data: dataUrl,
      x: imgX,
      y: imgY,
      w: imgW,
      h: imgH,
    });

    await pptx.writeFile({ fileName: filename });
  } finally {
    cleanup();
  }
}
