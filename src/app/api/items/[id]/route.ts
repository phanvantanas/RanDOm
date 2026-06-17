import { NextResponse } from 'next/server';
import { prisma, isDbAvailable } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isDbAvailable || !prisma) {
      // Mock mode success
      return NextResponse.json({ success: true, dbAvailable: false });
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, dbAvailable: true });
  } catch (error) {
    console.error("DELETE /api/items/[id] error:", error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
