import { toBlob, toPng, toSvg } from 'html-to-image';

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

export async function copyPngToClipboard(element: HTMLElement): Promise<void> {
  try {
    const blob = await toBlob(element, EXPORT_OPTIONS);
    if (!blob) throw new Error('Failed to generate image');

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
  } catch (err) {
    // Safari fallback: use Promise-based ClipboardItem
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
}

export async function downloadPng(
  element: HTMLElement,
  filename: string = 'cascade-chart.png'
): Promise<void> {
  const dataUrl = await toPng(element, EXPORT_OPTIONS);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function downloadSvg(
  element: HTMLElement,
  filename: string = 'cascade-chart.svg'
): Promise<void> {
  const dataUrl = await toSvg(element, {
    ...EXPORT_OPTIONS,
    pixelRatio: 1,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function copySvgToClipboard(element: HTMLElement): Promise<void> {
  const svgElement = element.querySelector('svg');
  if (!svgElement) throw new Error('No SVG element found');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  await navigator.clipboard.writeText(svgString);
}

export async function downloadPptx(
  element: HTMLElement,
  filename: string = 'cascade-chart.pptx',
  options?: { isDarkMode?: boolean; toggleDarkMode?: () => void }
): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;

  // Force light mode for PPTX since slides have white backgrounds
  const wasDarkMode = options?.isDarkMode;
  if (wasDarkMode && options?.toggleDarkMode) {
    options.toggleDarkMode();
    // Wait for React to re-render with light mode colors
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  const dataUrl = await toPng(element, {
    ...EXPORT_OPTIONS,
    backgroundColor: '#ffffff',
    style: { background: '#ffffff' },
    pixelRatio: 3,
  });

  // Restore dark mode if it was active
  if (wasDarkMode && options?.toggleDarkMode) {
    options.toggleDarkMode();
  }

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
}
