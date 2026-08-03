import Drawer from "@/components/Drawer/Drawer";
import StateDetail from "@/components/detail/StateDetail";

export default async function StateModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Drawer title="State Wildlife Profile">
      <StateDetail slug={slug} />
    </Drawer>
  );
}
