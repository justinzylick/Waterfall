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

// Light-mode color mapping for export
const DARK_TO_LIGHT: Record<string, string> = {
  '#F3F4F6': '#1F2937',  // chart-label: gray-100 → gray-800
  '#E5E7EB': '#6B7280',  // chart-axis: gray-200 → gray-500
  '#D1D5DB': '#6B7280',  // chart-subtitle: gray-300 → gray-500
  '#4B5563': '#9CA3AF',  // gridColor dark → gridColor light
};

/**
 * Temporarily swap SVG text/line fill and stroke colors from dark-mode
 * values to light-mode values directly on the DOM, run the export,
 * then restore. No theme toggle, no overlay, no flash.
 */
async function withExportColors<T>(
  element: HTMLElement,
  options: ExportDarkModeOptions | undefined,
  fn: () => Promise<T>
): Promise<T> {
  if (!options?.isDarkMode) return fn();

  // Collect all SVG elements with fills/strokes to swap
  const restoreFns: (() => void)[] = [];

  const texts = element.querySelectorAll('svg text');
  texts.forEach((el) => {
    const fill = el.getAttribute('fill');
    if (fill && DARK_TO_LIGHT[fill]) {
      el.setAttribute('fill', DARK_TO_LIGHT[fill]);
      restoreFns.push(() => el.setAttribute('fill', fill));
    }
  });

  const lines = element.querySelectorAll('svg line');
  lines.forEach((el) => {
    const stroke = el.getAttribute('stroke');
    if (stroke && DARK_TO_LIGHT[stroke]) {
      el.setAttribute('stroke', DARK_TO_LIGHT[stroke]);
      restoreFns.push(() => el.setAttribute('stroke', stroke));
    }
  });

  const result = await fn();

  // Restore original colors
  restoreFns.forEach((restore) => restore());

  return result;
}

export async function copyPngToClipboard(
  element: HTMLElement,
  options?: ExportDarkModeOptions
): Promise<void> {
  await withExportColors(element, options, async () => {
    try {
      const blob = await toBlob(element, EXPORT_OPTIONS);
      if (!blob) throw new Error('Failed to generate image');

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
    } catch (err) {
      const blobPromise = toBlob(element, EXPORT_OPTIONS).then((b) => {
        if (!b) throw new Error('Failed to generate image');
        return b;
      });
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blobPromise,
        }),
      ]);
    }
  });
}

export async function downloadPng(
  element: HTMLElement,
  filename: string = 'cascade-chart.png',
  options?: ExportDarkModeOptions
): Promise<void> {
  await withExportColors(element, options, async () => {
    const dataUrl = await toPng(element, EXPORT_OPTIONS);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  });
}

export async function downloadSvg(
  element: HTMLElement,
  filename: string = 'cascade-chart.svg',
  options?: ExportDarkModeOptions
): Promise<void> {
  await withExportColors(element, options, async () => {
    const dataUrl = await toSvg(element, {
      ...EXPORT_OPTIONS,
      pixelRatio: 1,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  });
}

export async function downloadPptx(
  element: HTMLElement,
  filename: string = 'cascade-chart.pptx',
  options?: ExportDarkModeOptions
): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;

  await withExportColors(element, options, async () => {
    const dataUrl = await toPng(element, {
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
  });
}
