import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  CSSResult,
  css,
} from "lit-element";

import "@material/mwc-list/mwc-list";

import type { HomeAssistant } from "../../types";
import {
  MediaPlayerBrowseAction,
  MediaPlayerItem,
} from "../../data/media-player";
import { MediaPlayerItemThumbnailRatio } from "./ha-media-grid-item";
import "./ha-media-list-item";

export enum MediaListType {
  GRID = "grid",
  LIST = "list",
}

@customElement("ha-media-list")
export class MediaList extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public items?: MediaPlayerItem[];
  @property() public type?: MediaListType;
  @property() public action?: MediaPlayerBrowseAction;
  @property() public thumbnailRatio: MediaPlayerItemThumbnailRatio =
    MediaPlayerItemThumbnailRatio.SQUARE;

  private _action(item: MediaPlayerItem): MediaPlayerBrowseAction | void {
    if (this.action === MediaPlayerBrowseAction.PLAY && item.can_play) {
      return MediaPlayerBrowseAction.PLAY;
    } else {
      return this.action;
    }
  }

  private dispatchRelay(e: CustomEvent): void {
    this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail }));
  }

  protected render(): TemplateResult {
    if (!this.items?.length || !this.hass) {
      return html``;
    }

    switch (this.type) {
      case MediaListType.GRID:
        return html`
          <div class="grid">
            ${this.items.map(
              (item) => html`
                <ha-media-grid-item
                  .item=${item}
                  .expandable=${item.can_expand}
                  .thumbnailRatio=${this.thumbnailRatio}
                  .action=${this._action(item)}
                  .hass=${this.hass}
                  @media-item-action-clicked=${this.dispatchRelay}
                  @media-item-clicked=${this.dispatchRelay}
                ></ha-media-grid-item>
              `
            )}
          </div>
        `;
      case MediaListType.LIST:
        return html`<mwc-list>
          ${this.items.map(
            (item) => html`
              <ha-media-list-item
                .item=${item}
                .expandable=${item.can_expand}
                .thumbnailRatio=${this.thumbnailRatio}
                .action=${this._action(item)}
                .hass=${this.hass}
                @media-item-action-clicked=${this.dispatchRelay}
                @media-item-clicked=${this.dispatchRelay}
              ></ha-media-list-item>
            `
          )}
        </mwc-list>`;
      default:
        return html``;
    }
  }

  static get styles(): CSSResult {
    return css`
      .grid {
        display: grid;
        grid-template-columns: repeat(
          auto-fit,
          minmax(var(--media-browse-item-size, 175px), 0.1fr)
        );
        grid-gap: 16px;
        padding: 0px 24px;
        margin: 8px 0px;
      }

      .grid.portrait ha-card {
        padding-bottom: 150%;
      }

      :host([narrow]) .grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
      }

      mwc-list {
        --mdc-list-vertical-padding: 0;
        --mdc-list-item-graphic-margin: 0;
        --mdc-theme-text-icon-on-background: var(--secondary-text-color);
        margin-top: 10px;
      }

      mwc-list li:last-child {
        display: none;
      }

      mwc-list li[divider] {
        border-bottom-color: var(--divider-color);
      }

      :host([dialog]) .grid {
        grid-template-columns: repeat(
          auto-fit,
          minmax(var(--media-browse-item-size, 175px), 0.33fr)
        );
      }
    `;
  }
}
