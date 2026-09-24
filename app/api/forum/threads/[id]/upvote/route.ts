import { NextRequest, NextResponse } from 'next/server';
import { upvoteThread } from '@/lib/db';
import { getClientIP, checkUpvoteSpam } from '@/lib/anti-spam';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const ip = getClientIP(request);

  const spamCheck = checkUpvoteSpam(ip, id);
  if (!spamCheck.allowed) {
    return NextResponse.json(
      { success: false, error: spamCheck.reason },
      { status: 429 }
    );
  }

  const upvotes = upvoteThread(id);
  return NextResponse.json({ success: true, upvotes });
}

