import StateDetail from "@/components/detail/StateDetail";
import Link from "next/link";
import { X } from "lucide-react";

export default async function StatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-700">
            State Info
          </h2>
          <Link
            href="/"
            aria-label="Close panel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-6">
          <StateDetail slug={slug} />
        </div>
      </div>
    </div>
  );
}
