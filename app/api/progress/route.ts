import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const filePath = path.join(process.cwd(), "data", "gta-sa-progress.json");

type Progress = { checked: Record<string, boolean>; updatedAt: string | null };

async function readProgress(): Promise<Progress> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Progress;
  } catch {
    return { checked: {}, updatedAt: null };
  }
}

export async function GET() {
  return NextResponse.json(await readProgress());
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { checked?: Record<string, boolean> };
    if (!body.checked || typeof body.checked !== "object" || Array.isArray(body.checked)) {
      return NextResponse.json({ error: "Invalid progress payload." }, { status: 400 });
    }
    const checked = Object.fromEntries(
      Object.entries(body.checked).filter(([key, value]) => typeof key === "string" && typeof value === "boolean")
    );
    const progress: Progress = { checked, updatedAt: new Date().toISOString() };
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Unable to save progress." }, { status: 500 });
  }
}
