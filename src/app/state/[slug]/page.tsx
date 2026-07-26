import StateDetail from "@/components/detail/StateDetail";

export default async function StatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <StateDetail slug={slug} />
    </div>
  );
}
