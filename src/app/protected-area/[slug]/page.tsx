import ProtectedAreaDetail from "@/components/detail/ProtectedAreaDetail";

export default async function ProtectedAreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <ProtectedAreaDetail slug={slug} />
    </div>
  );
}
