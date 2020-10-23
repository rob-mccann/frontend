import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  CSSResult,
  css,
} from "lit-element";

import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";

import { mdiPlay, mdiPlus } from "@mdi/js";

import type { HomeAssistant } from "../../types";
import {
  MediaClassBrowserSettings,
  MediaPlayerItem,
} from "../../data/media-player";

export enum MediaPlayerItemAction {
  PLAY = "play",
  EXPAND = "expand",
}

export enum MediaPlayerItemThumbnailRatio {
  PORTRAIT = "portrait",
  SQUARE = "square",
}

@customElement("ha-media-grid-item")
export class MediaLauncherCardMediaItem extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public mediaPlayerItem?: MediaPlayerItem;
  @property() public action?: MediaPlayerItemAction =
    MediaPlayerItemAction.PLAY;
  @property() public thumbnailRatio: MediaPlayerItemThumbnailRatio =
    MediaPlayerItemThumbnailRatio.SQUARE;

  private onActionClick(ev: MouseEvent): void {
    ev.stopPropagation();

    const item = (ev.currentTarget as any).item as MediaPlayerItem;

    this.dispatchEvent(
      new CustomEvent<MediaPlayerItem>("media-item-action-clicked", {
        detail: item,
      })
    );
  }

  private onItemClick(ev: MouseEvent): void {
    ev.stopPropagation();

    const item = (ev.currentTarget as any).item as MediaPlayerItem;

    this.dispatchEvent(
      new CustomEvent<MediaPlayerItem>("media-item-clicked", { detail: item })
    );
  }

  private get icon(): string {
    switch (this.action) {
      case MediaPlayerItemAction.PLAY:
        return mdiPlay;
      default:
        return mdiPlus;
    }
  }

  protected render(): TemplateResult | void {
    const item = this.mediaPlayerItem;

    if (!item || !this.hass) {
      return html``;
    }

    return html`
      <div
        class="item"
        .item=${item}
        @click=${this.onItemClick}
        >
        <div class="ha-card-parent">
          <ha-card
            outlined
            class=${`thumbnail-ratio-${this.thumbnailRatio}`}
            style=${styleMap({
              backgroundImage: item.thumbnail
                ? `url(${item.thumbnail})`
                : "none",
            })}
          >
            ${
              !item.thumbnail
                ? html`
                    <ha-svg-icon
                      class="large-icon"
                      .path=${MediaClassBrowserSettings[
                        item.media_class === "directory"
                          ? item.children_media_class || item.media_class
                          : item.media_class
                      ].icon}
                    ></ha-svg-icon>
                  `
                : ""
            }
          </ha-card>
          ${
            item.can_play
              ? html`
                  <mwc-icon-button
                    class="icon ${this.action}"
                    .item=${item}
                    .label=${this.hass.localize(
                      `ui.components.media-browser.${this.action}-media`
                    )}
                    @click=${this.onActionClick}
                  >
                    <ha-svg-icon .path=${this.icon}></ha-svg-icon>
                  </mwc-icon-button>
                `
              : ""
          }
        </div>
        <div class="title">
          ${item.title}
          <paper-tooltip
            fitToVisibleBounds
            position="top"
            offset="4"
            >${item.title}</paper-tooltip
          >
        </div>
        <div class="type">
          ${this.hass.localize(
            `ui.components.media-browser.content-type.${item.media_content_type}`
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
        --mdc-icon-button-size: 70px;
        --mdc-icon-size: 48px;
      }

      .item .large-icon {
        position: absolute;
        color: var(--secondary-text-color);
        top: calc(50% - (var(--mdc-icon-size) / 2));
        left: calc(50% - (var(--mdc-icon-size) / 2));
        --mdc-icon-size: calc(var(--media-browse-item-size, 175px) * 0.4);
      }

      .ha-card-parent:hover .icon {
        opacity: 1;
        color: var(--primary-color);
      }

      .item .icon.expand {
        opacity: 1;
        background-color: rgba(var(--rgb-card-background-color), 0.5);
        bottom: 4px;
        right: 4px;
      }

      .item .icon:hover {
        color: var(--primary-color);
      }

      .ha-card-parent:hover ha-card {
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
