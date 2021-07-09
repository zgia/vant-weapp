import { getCurrentPage } from '../common/utils';

type IPageScrollOption = WechatMiniprogram.Page.IPageScrollOption;
type Scroller = (
  this: WechatMiniprogram.Component.TrivialInstance,
  event?: IPageScrollOption
) => void;

function onPageScroll(event?: IPageScrollOption) {
  const { vanPageScroller = [] } = getCurrentPage<{
    vanPageScroller: Scroller[];
  }>();

  vanPageScroller.forEach((scroller: Scroller) => {
    if (typeof scroller === 'function') {
      // @ts-ignore
      scroller(event);
    }
  });
}

export const pageScrollMixin = (scroller: Scroller) =>
  Behavior({
    attached() {
      const page = getCurrentPage<{ vanPageScroller: Scroller[] }>();

      if (Array.isArray(page.vanPageScroller)) {
        page.vanPageScroller.push(scroller.bind(this));
      } else {
        page.vanPageScroller =
          typeof page.onPageScroll === 'function'
            ? [page.onPageScroll.bind(page), scroller.bind(this)]
            : [scroller.bind(this)];
      }

      page.onPageScroll = onPageScroll;
    },

    detached() {
      const page = getCurrentPage<{ vanPageScroller: Scroller[] }>();
      page.vanPageScroller =
        page.vanPageScroller?.filter((item) => item !== scroller) || [];
    },
  });
