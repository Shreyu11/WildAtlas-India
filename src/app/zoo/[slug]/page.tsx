import ZooDetail from "@/components/detail/ZooDetail";

export default async function ZooPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <ZooDetail slug={slug} />
    </div>
  );
}
