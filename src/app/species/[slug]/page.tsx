import SpeciesDetail from "@/components/detail/SpeciesDetail";

export default async function SpeciesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <SpeciesDetail slug={slug} />
    </div>
  );
}
