import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { category, message, email, context } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const categoryLabel: Record<string, string> = {
      feature: 'Feature Request',
      bug: 'Bug Report',
      chart: 'New Chart Type',
      other: 'Other',
    };

    await resend.emails.send({
      from: 'Chart Lab <feedback@resend.dev>',
      to: process.env.FEEDBACK_EMAIL || 'justin.zylick@diageo.com',
      subject: `[Chart Lab] ${categoryLabel[category] || category}: ${message.slice(0, 60)}`,
      html: `
        <h2>${categoryLabel[category] || category}</h2>
        <p style="white-space: pre-wrap;">${message}</p>
        ${email ? `<p><strong>Reply to:</strong> ${email}</p>` : ''}
        <hr />
        <p style="color: #888; font-size: 12px;">
          Chart: ${context?.chartType || 'unknown'}<br />
          Dark mode: ${context?.isDarkMode ? 'yes' : 'no'}
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
  }
}
