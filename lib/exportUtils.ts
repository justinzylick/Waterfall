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
