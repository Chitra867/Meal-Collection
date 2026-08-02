import ListScreen from "../components/ListScreen";

export default function HomeScreen({
  items = [],
  onAdd,
  onEdit,
  onDelete,
  onOpenDetails,
  onToggleFavourite,
}) {
  return (
    <ListScreen
  title="Explore Recipes"
  items={items}
  onAdd={onAdd}
  onEdit={onEdit}
  onDelete={onDelete}
  onOpenDetails={onOpenDetails}
  onToggleFavourite={onToggleFavourite}
/>
  );
}