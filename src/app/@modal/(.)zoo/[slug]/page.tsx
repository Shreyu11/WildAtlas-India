import Drawer from "@/components/Drawer/Drawer";
import ZooDetail from "@/components/detail/ZooDetail";

export default async function ZooModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Drawer title="Zoo Info">
      <ZooDetail slug={slug} />
    </Drawer>
  );
}
