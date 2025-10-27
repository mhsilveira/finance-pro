import { NextResponse } from "next/server";
import { db } from "./data";

export async function GET() {
    try {
        const items = await db.all();
        return NextResponse.json(items);
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const created = await db.add(body);
        return NextResponse.json(created, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}
