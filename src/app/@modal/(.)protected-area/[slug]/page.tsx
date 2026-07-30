import Drawer from "@/components/Drawer/Drawer";
import ProtectedAreaDetail from "@/components/detail/ProtectedAreaDetail";

export default async function ProtectedAreaModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Drawer title="Protected Area Info">
      <ProtectedAreaDetail slug={slug} />
    </Drawer>
  );
}
