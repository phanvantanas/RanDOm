import { NextResponse } from 'next/server';
import { prisma, isDbAvailable } from '@/lib/prisma';
import { defaultCategories } from '@/lib/defaults';

export async function GET() {
  if (!isDbAvailable || !prisma) {
    return NextResponse.json({
      categories: defaultCategories.map((cat, idx) => ({
        id: `mock-category-${idx}`,
        name: cat.name,
        items: cat.items.map((item, iidx) => ({
          id: `mock-item-${idx}-${iidx}`,
          name: item.name,
          color: item.color,
          categoryId: `mock-category-${idx}`
        }))
      })),
      dbAvailable: false
    });
  }

  try {
    const categories = await prisma.category.findMany({
      include: { items: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ categories, dbAvailable: true });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    if (!isDbAvailable || !prisma) {
      // In mock mode, pretend we succeeded so client can manage in localStorage
      return NextResponse.json({
        category: {
          id: `mock-category-${Date.now()}`,
          name: name.trim(),
          items: []
        },
        dbAvailable: false
      });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
      include: { items: true }
    });

    return NextResponse.json({ category, dbAvailable: true });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
