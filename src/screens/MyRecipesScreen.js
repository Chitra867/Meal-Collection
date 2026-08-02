import { useMemo } from "react";

import ListScreen from "../components/ListScreen";

export default function MyRecipesScreen({
  items = [],
  onAdd,
  onEdit,
  onDelete,
  onOpenDetails,
  onToggleFavourite,
}) {
  const myRecipes = useMemo(
    () =>
      items.filter(
        (item) => item.source === "mine"
      ),
    [items]
  );

  return (
    <ListScreen
  title="My Recipes"
  items={myRecipes}
  emptyMessage="You have not created any recipes."
  onAdd={onAdd}
  onEdit={onEdit}
  onDelete={onDelete}
  onOpenDetails={onOpenDetails}
  onToggleFavourite={onToggleFavourite}
/>
  );
}