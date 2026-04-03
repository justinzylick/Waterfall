import { toBlob, toPng, toSvg } from 'html-to-image';

export interface ExportDarkModeOptions {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
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

/**
 * Temporarily switch to light mode for export, hiding the flash
 * with an opaque overlay so the user sees nothing.
 */
async function withLightMode<T>(
  options: ExportDarkModeOptions | undefined,
  element: HTMLElement,
  fn: () => Promise<T>
): Promise<T> {
  const wasDarkMode = options?.isDarkMode;
  let overlay: HTMLDivElement | null = null;

  if (wasDarkMode && options?.toggleDarkMode) {
    // Create an opaque overlay matching the current dark background
    // to hide the brief light-mode flash
    overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: #030712; pointer-events: none;
    `;
    document.body.appendChild(overlay);

    options.toggleDarkMode();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  const result = await fn();

  if (wasDarkMode && options?.toggleDarkMode) {
    options.toggleDarkMode();
    // Remove overlay after dark mode is restored
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    overlay?.remove();
  }

  return result;
}

export async function copyPngToClipboard(
  element: HTMLElement,
  options?: ExportDarkModeOptions
): Promise<void> {
  await withLightMode(options, element, async () => {
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
  await withLightMode(options, element, async () => {
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
  await withLightMode(options, element, async () => {
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

  await withLightMode(options, element, async () => {
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
