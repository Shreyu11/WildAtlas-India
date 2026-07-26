import Drawer from "@/components/Drawer/Drawer";
import SpeciesDetail from "@/components/detail/SpeciesDetail";

export default async function SpeciesModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Drawer>
      <SpeciesDetail slug={slug} />
    </Drawer>
  );
}
