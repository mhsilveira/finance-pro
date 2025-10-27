import { NextResponse } from "next/server";
import { db } from "../data";

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await _req.json();
        const updated = await db.update(body);
        return NextResponse.json(updated);
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await db.remove(params.id);
        return NextResponse.json({ id: params.id });
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}
