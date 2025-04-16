import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const idsString = searchParams.get('ids');

    if (!idsString) {
        return NextResponse.json({ error: "Array of image IDs is required in the 'ids' query parameter" }, { status: 400 });
    }

    const ids = idsString.split(',').map(id => id.trim());

    if (ids.some(idStr => isNaN(Number(idStr)))) {
        return NextResponse.json({ error: "All IDs in the 'ids' query parameter must be valid numbers" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("images")
        .select("id, name, base64")
        .in("id", ids); // Use the .in() filter for an array of IDs

    if (error) {
        console.error("❌ Supabase Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
        console.warn(`⚠️ ไม่พบรูปภาพที่มี IDs: ${ids.join(', ')} ใน Supabase`);
        return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
}