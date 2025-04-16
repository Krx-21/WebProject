import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY! 
);

export async function POST(req: Request) {
    try {
        const { name, base64 } = await req.json();

        const { data, error } = await supabase.from("images").insert([{ name, base64 }]).select("id");

        if (error) throw error;

        return NextResponse.json({ message: "Uploaded!", data }, { status: 200 });
    } catch (error: any) {
        console.error("🔥 Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
