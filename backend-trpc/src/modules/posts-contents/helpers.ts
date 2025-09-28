import type { PostContentItemWithId } from './models';

export function sortPostContentItems(
  order: Array<string>,
  items: Array<PostContentItemWithId>,
): Array<PostContentItemWithId> {
  const itemMap = new Map(items.map((item) => [item.contentId, item]));
  return order.map((id) => itemMap.get(id)).filter((item): item is PostContentItemWithId => item !== undefined);
}
