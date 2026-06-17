import { NextResponse } from 'next/server';
import { prisma, isDbAvailable } from '@/lib/prisma';

export async function GET() {
  if (!isDbAvailable || !prisma) {
    return NextResponse.json({ history: [], dbAvailable: false });
  }

  try {
    const history = await prisma.spinHistory.findMany({
      orderBy: { spunAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ history, dbAvailable: true });
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemName, categoryName } = body;

    if (!itemName || !categoryName) {
      return NextResponse.json({ error: 'itemName and categoryName are required' }, { status: 400 });
    }

    if (!isDbAvailable || !prisma) {
      return NextResponse.json({
        historyItem: {
          id: `mock-history-${Date.now()}`,
          itemName,
          categoryName,
          spunAt: new Date().toISOString()
        },
        dbAvailable: false
      });
    }

    const historyItem = await prisma.spinHistory.create({
      data: {
        itemName,
        categoryName,
      },
    });

    return NextResponse.json({ historyItem, dbAvailable: true });
  } catch (error) {
    console.error("POST /api/history error:", error);
    return NextResponse.json({ error: 'Failed to create history log' }, { status: 500 });
  }
}

export async function DELETE() {
  if (!isDbAvailable || !prisma) {
    return NextResponse.json({ success: true, dbAvailable: false });
  }

  try {
    await prisma.spinHistory.deleteMany();
    return NextResponse.json({ success: true, dbAvailable: true });
  } catch (error) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
