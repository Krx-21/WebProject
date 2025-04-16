import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function DELETE(request: Request) {
    console.log("DELETE request received");
    console.log("Request body:", request.body);
    try {
        const reqBody = await request.json();
        const idsToDelete: string[] | undefined = reqBody.ids;

        if (!idsToDelete || !Array.isArray(idsToDelete) || idsToDelete.length === 0) {
            return NextResponse.json({ error: "An array of image IDs to delete is required in the request body as 'ids'" }, { status: 400 });
        }

        if (idsToDelete.some(idStr => isNaN(Number(idStr)))) {
            return NextResponse.json({ error: "All IDs in the 'ids' array must be valid numbers" }, { status: 400 });
        }

        const { error } = await supabase
            .from("images")
            .delete()
            .in("id", idsToDelete.map(Number)); // Use .in() to delete multiple IDs

        if (error) {
            console.error("❌ Supabase Error (DELETE Multiple):", error);
            return NextResponse.json({ error: `Failed to delete images with IDs ${idsToDelete.join(', ')}: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: `Successfully deleted images with IDs: ${idsToDelete.join(', ')}` }, { status: 200 });

    } catch (error: any) {
        console.error("🔥 DELETE Multiple Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error during delete" }, { status: 500 });
    }
}