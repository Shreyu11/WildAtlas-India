import { List } from "@/design-system";

interface LinkPreviewCardProps {
  label: string;
  url: string;
  category?: "official" | "travel" | "wiki" | "general";
}

export default function LinkPreviewCard({ label, url, category }: LinkPreviewCardProps) {
  return <List.LinkItem label={label} url={url} category={category} />;
}
