import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  CSSResult,
  css,
} from "lit-element";

import { styleMap } from "lit-html/directives/style-map";
import { classMap } from "lit-html/directives/class-map";

import { mdiPlay, mdiPlus } from "@mdi/js";

import "../ha-card";

import type { HomeAssistant } from "../../types";
import {
  MediaClassBrowserSettings,
  MediaPlayerBrowseAction,
  MediaPlayerItem,
} from "../../data/media-player";

export enum MediaPlayerItemThumbnailRatio {
  PORTRAIT = "portrait",
  SQUARE = "square",
}

export enum ClickEventTarget {
  ITEM = "item",
  ACTION = "action",
}

@customElement("ha-media-grid-item")
export class MediaGridItem extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public item?: MediaPlayerItem;
  @property() public action?: MediaPlayerBrowseAction;
  @property() public thumbnailRatio: MediaPlayerItemThumbnailRatio =
    MediaPlayerItemThumbnailRatio.SQUARE;
  @property() public expandable: boolean = false;

  private onClick(target: ClickEventTarget, ev: MouseEvent): void {
    ev.stopPropagation();

    if (!this.action && !this.expandable) {
      return;
    }

    const item = (ev.currentTarget as any).item as MediaPlayerItem;

    const eventName =
      target === ClickEventTarget.ITEM
        ? "media-item-clicked"
        : "media-item-action-clicked";

    this.dispatchEvent(
      new CustomEvent<MediaPlayerItem>(eventName, { detail: item })
    );
  }

  private get icon(): string {
    switch (this.action) {
      case MediaPlayerBrowseAction.PLAY:
        return mdiPlay;
      default:
        return mdiPlus;
    }
  }

  protected render(): TemplateResult | void {
    if (!this.item || !this.hass) {
      return html``;
    }

    return html`
      <div
        class="item ${classMap({
          ["item-expandable"]: this.expandable,
          ["item-actionnable"]: !!this.action,
        })}"
        .item=${this.item}
        @click=${this.onClick.bind(this, ClickEventTarget.ITEM)}
        >
        <div class="ha-card-parent">
          <ha-card
            outlined
            class=${`thumbnail-ratio-${this.thumbnailRatio}`}
            style=${styleMap({
              backgroundImage: this.item.thumbnail
                ? `url(${this.item.thumbnail})`
                : "none",
            })}
          >
            ${
              !this.item.thumbnail
                ? html`
                    <ha-svg-icon
                      class="large-icon"
                      .path=${MediaClassBrowserSettings[
                        this.item.media_class === "directory"
                          ? this.item.children_media_class ||
                            this.item.media_class
                          : this.item.media_class
                      ].icon}
                    ></ha-svg-icon>
                  `
                : ""
            }
          </ha-card>
          ${
            this.action
              ? html`
                  <mwc-icon-button
                    class="icon ${this.action}"
                    .item=${this.item}
                    .label=${this.hass.localize(
                      `ui.components.media-browser.${this.action}-media`
                    )}
                    @click=${this.onClick.bind(this, ClickEventTarget.ACTION)}
                  >
                    <ha-svg-icon .path=${this.icon}></ha-svg-icon>
                  </mwc-icon-button>
                `
              : ""
          }
        </div>
        <div class="title">
          ${this.item.title}
          <paper-tooltip
            fitToVisibleBounds
            position="top"
            offset="4"
            >${this.item.title}</paper-tooltip>
        </div>
        <div class="type">
          ${this.hass.localize(
            `ui.components.media-browser.content-type.${this.item.media_content_type}`
          )}
        </div>
      </div>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .item {
        display: flex;
        flex-direction: column;
      }

      .item-actionnable,
      .item-expandable {
        cursor: pointer;
      }

      .ha-card-parent {
        position: relative;
        width: 100%;
      }

      .item ha-card {
        width: 100%;
        padding-bottom: 100%;
        position: relative;
        box-sizing: border-box;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        transition: padding-bottom 0.1s ease-out;
      }

      .item ha-card.thumbnail-ratio-portrait {
        padding-bottom: 150%;
      }

      .item .icon {
        position: absolute;
        transition: color 0.5s;
        border-radius: 50%;
        bottom: calc(50% - 35px);
        right: calc(50% - 35px);
        opacity: 0;
        transition: opacity 0.1s ease-out;
      }

      .item .large-icon {
        position: absolute;
        color: var(--secondary-text-color);
        top: calc(50% - (var(--mdc-icon-size) / 2));
        left: calc(50% - (var(--mdc-icon-size) / 2));
        --mdc-icon-size: calc(var(--media-browse-item-size, 175px) * 0.4);
      }

      .item:not(.item-expandable) .ha-card-parent:hover .icon {
        opacity: 1;
        color: var(--primary-color);
      }

      .item:not(.item-expandable) .icon {
        --mdc-icon-button-size: 70px;
        --mdc-icon-size: 48px;
      }

      .item-expandable .icon {
        opacity: 1;
        background-color: rgba(var(--rgb-card-background-color), 0.5);
        bottom: 4px;
        right: 4px;
      }

      .item .icon:hover {
        color: var(--primary-color);
      }

      .item-actionnable .ha-card-parent:hover ha-card,
      .item-expandable .ha-card-parent:hover ha-card {
        opacity: 0.5;
      }

      .item .title {
        font-size: 16px;
        padding-top: 8px;
        padding-left: 2px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
      }

      .item .type {
        font-size: 12px;
        color: var(--secondary-text-color);
        padding-left: 2px;
      }
    `;
  }
}
