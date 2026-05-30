import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params;

  return NextResponse.json({
    ready: true,
    adapter_path: `/__utrace/${path}`,
    adapter_version: "v1",
  });
}
