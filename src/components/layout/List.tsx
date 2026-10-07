import { FlashList } from '@shopify/flash-list';
import { cssInterop } from 'nativewind';

// Long, scrolling lists (Library, Voices, Instructions, Results) use
// FlashList: it recycles row views instead of mounting one per item, so
// memory stays flat however far the user scrolls. Rows must not keep
// their own state (useState), since a row is reused for other items.
//
// Registered with NativeWind here so lists take `className` and
// `contentContainerClassName` like any other view. Import FlashList from
// '@/components', not the package, so this always runs first.
cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

declare module '@shopify/flash-list' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- must match the original declaration
  interface FlashListProps<TItem> {
    className?: string;
    contentContainerClassName?: string;
  }
}

export { FlashList };
export type { ListRenderItem as FlashListRenderItem } from '@shopify/flash-list';
