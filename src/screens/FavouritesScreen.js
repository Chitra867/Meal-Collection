import { useMemo } from "react";

import ListScreen from "../components/ListScreen";

export default function FavouritesScreen({
  items = [],
  onEdit,
  onDelete,
  onOpenDetails,
  onToggleFavourite,
}) {
  const favouriteItems = useMemo(
    () =>
      items.filter(
        (item) => item.favourite
      ),
    [items]
  );

  return (
    <ListScreen
  title="Favourites"
  items={favouriteItems}
  emptyMessage="You have not added any favourite recipes."
  showFavouriteFilter={false}
  onEdit={onEdit}
  onDelete={onDelete}
  onOpenDetails={onOpenDetails}
  onToggleFavourite={onToggleFavourite}
/>
  );
}