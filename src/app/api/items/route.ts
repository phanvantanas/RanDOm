import { NextResponse } from 'next/server';
import { prisma, isDbAvailable } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, categoryId } = body;

    if (!name || typeof name !== 'string' || name.trim() === '' || !color || !categoryId) {
      return NextResponse.json({ error: 'Name, color, and categoryId are required' }, { status: 400 });
    }

    if (!isDbAvailable || !prisma) {
      // In mock mode, return standard mock response
      return NextResponse.json({
        item: {
          id: `mock-item-${Date.now()}`,
          name: name.trim(),
          color,
          categoryId
        },
        dbAvailable: false
      });
    }

    const item = await prisma.item.create({
      data: {
        name: name.trim(),
        color,
        categoryId,
      },
    });

    return NextResponse.json({ item, dbAvailable: true });
  } catch (error) {
    console.error("POST /api/items error:", error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
