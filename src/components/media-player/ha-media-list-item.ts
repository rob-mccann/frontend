import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  CSSResult,
  css,
} from "lit-element";

import "@material/mwc-list/mwc-list-item";

import { classMap } from "lit-html/directives/class-map";

import { mdiPlay, mdiPlus } from "@mdi/js";

import type { HomeAssistant } from "../../types";
import {
  MediaPlayerBrowseAction,
  MediaPlayerItem,
} from "../../data/media-player";
import { computeRTLDirection } from "../../common/util/compute_rtl";
import { ifDefined } from "lit-html/directives/if-defined";
import { ClickEventTarget } from "./ha-media-grid-item";

export enum MediaPlayerItemThumbnailRatio {
  PORTRAIT = "portrait",
  SQUARE = "square",
}

@customElement("ha-media-list-item")
export class MediaListItem extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public item?: MediaPlayerItem;
  @property() public showImages?: boolean = false;
  @property() public action?: MediaPlayerBrowseAction;

  private onClick(target: ClickEventTarget, ev: MouseEvent): void {
    ev.stopPropagation();

    const item = (ev.currentTarget as any).item as MediaPlayerItem;

    const eventName =
      target === ClickEventTarget.ITEM
        ? "media-item-clicked"
        : "media-item-action-clicked";

    this.dispatchEvent(
      new CustomEvent<MediaPlayerItem>(eventName, { detail: item })
    );
  }

  protected render(): TemplateResult | void {
    if (!this.item || !this.hass) {
      return html``;
    }

    return html`
      <mwc-list-item
        @click=${this.onClick.bind(this, ClickEventTarget.ITEM)}
        .item=${this.item}
        graphic="avatar"
        hasMeta
        dir=${computeRTLDirection(this.hass)}
      >
        <div
          class="graphic"
          style=${ifDefined(
            this.showImages && this.item.thumbnail
              ? `background-image: url(${this.item.thumbnail})`
              : undefined
          )}
          slot="graphic"
        >
          <mwc-icon-button
            class="play ${classMap({
              show: !this.showImages || !this.item.thumbnail,
            })}"
            .item=${this.item}
            .label=${this.hass.localize(
              `ui.components.media-browser.${this.action}-media`
            )}
            @click=${this.onClick.bind(this, ClickEventTarget.ACTION)}
          >
            <ha-svg-icon
              .path=${this.action === MediaPlayerBrowseAction.PLAY
                ? mdiPlay
                : mdiPlus}
            ></ha-svg-icon>
          </mwc-icon-button>
        </div>
        <span class="title">${this.item.title}</span>
      </mwc-list-item>
      <li divider role="separator"></li>
    `;
  }

  static get styles(): CSSResult {
    return css`
      mwc-list-item .graphic {
        background-size: cover;
      }

      mwc-list-item .graphic .play {
        opacity: 0;
        transition: all 0.5s;
        background-color: rgba(var(--rgb-card-background-color), 0.5);
        border-radius: 50%;
        --mdc-icon-button-size: 40px;
      }

      mwc-list-item:hover .graphic .play {
        opacity: 1;
        color: var(--primary-color);
      }

      mwc-list-item .graphic .play.show {
        opacity: 1;
        background-color: transparent;
      }

      mwc-list-item .title {
        margin-left: 16px;
      }
      mwc-list-item[dir="rtl"] .title {
        margin-right: 16px;
        margin-left: 0;
      }
    `;
  }
}
