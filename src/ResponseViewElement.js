/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-headers/headers-list.js';
import { ExportEvents, WorkspaceEvents } from '@advanced-rest-client/arc-events';
import elementStyles from './styles/ResponseView.styles.js';
import { bytesToSize, readContentType, readBodyString } from './Utils.js';
import { MimeTypes } from './lib/MimeTypes.js';
import '../request-timings-panel.js';
import '../response-body.js';
import {
  emptyResponseScreenTemplate,
  responseTabsTemplate,
  openedTabs,
  selectedTab,
  tabItem,
  tabMenu,
  tabSelectHandler,
  tabClickHandler,
  tabCloseHandler,
  clearResponseTemplate,
  clearResponseHandler,
  tabContentTemplate,
  tabTemplate,
  responseTemplate,
  detailsTemplate,
  unknownTemplate,
  timingsTemplate,
  statusLabel,
  computeStatusClasses,
  loadingTimeTemplate,
  responseSizeTemplate,
  responseOptionsTemplate,
  responseBodyTemplate,
  errorResponse,
  requestHeadersTemplate,
  responseHeadersTemplate,
  redirectsTemplate,
  urlStatusTemplate,
  redirectItemTemplate,
  computeRedirectLocation,
  contentActionHandler,
  saveResponseFile,
  copyResponseClipboard,
  redirectLinkHandler,
} from './internals.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('@anypoint-web-components/anypoint-menu-button').AnypointMenuButton} AnypointMenuButton */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.RequestsSize} RequestsSize */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.ResponseRedirect} ResponseRedirect */

export const availableTabs = [
  {
    id: 'response',
    label: 'Response',
  },
  {
    id: 'timings',
    label: 'Timings',
  },
  {
    id: 'headers',
    label: 'Headers',
  },
  {
    id: 'redirects',
    label: 'Redirects',
  }
];

/**
 * @fires activechange When a list of active panels change
 * @fires selectedchange When a list of active panels change
 */
export class ResponseViewElement extends LitElement {
  static get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * ARC HTTP response object
       */
      response: { type: Object },
      /** 
       * ARC HTTP request object
       */
      request: { type: Object },
      /** 
       * A list of active panels (in order) rendered in the tabs.
       */
      active: { type: Array },
      /** 
       * The currently selected panel
       * @attribute
       */
      selected: { type: String },
    };
  }

  /**
   * @returns {boolean} Tests whether the response is set
   */
  get hasResponse() {
    const { response } = this;
    return !!response;
  }

  /**
   * @returns {string[]} A list of currently active panels
   */
  get active() {
    return this[openedTabs];
  }

  /**
   * @param {string[]} value The list of active panels.
   */
  set active(value) {
    const old = this[openedTabs];
    if (old === value || !Array.isArray(value)) {
      return;
    }
    this[openedTabs] = (value || []).filter((item) => availableTabs.some((tab) => tab.id === item));
    this.requestUpdate();
  }

  /**
   * @returns {string} The currently selected panel
   */
  get selected() {
    return this[selectedTab];
  }

  /**
   * @param {string} value The panel id to select.
   */
  set selected(value) {
    const old = this[selectedTab];
    if (old === value) {
      return;
    }
    const valid = availableTabs.some((tab) => tab.id === value);
    if (!valid) {
      return;
    }
    this[selectedTab] = value;
  }

  constructor() {
    super();
    /**
     * The id of the currently rendered tab
     */
    this[selectedTab] = 'response';
    /**
     * A list of tabs that are opened by the user (rendered in the DOM)
     */
    this[openedTabs] = ['response'];
  }

  /**
   * A handler for the tab selection. It activates a tab, if necessary.
   * @param {CustomEvent} e
   */
  async [tabSelectHandler](e) {
    const listbox = /** @type AnypointListbox */ (e.target);
    const id = e.detail.selected;
    if (!this[openedTabs].includes(String(id))) {
      this[openedTabs].push(String(id));
      this.dispatchEvent(new CustomEvent('activechange'));
    }
    if (id !== this[selectedTab]) {
      this[selectedTab] = id;
      this.dispatchEvent(new CustomEvent('selectedchange'));
    }
    await this.requestUpdate();
    listbox.selected = undefined;
  }

  /**
   * A handler for the content action drop down item selection
   * @param {CustomEvent} e
   */
  async [contentActionHandler](e) {
    // const listbox = /** @type AnypointListbox */ (e.target);
    const id = e.detail.selected;
    switch (id) {
      case 'save': return this[saveResponseFile]();
      case 'copy': return this[copyResponseClipboard]();
      default: return undefined;
    }
  }

  /**
   * A handler for the tab name click. Selects a tab.
   * @param {Event} e
   */
  [tabClickHandler](e) {
    const node = /** @type HTMLDivElement */ (e.currentTarget);
    const { id } = node.dataset;
    if (id !== this[selectedTab]) {
      this[selectedTab] = id;
      this.dispatchEvent(new CustomEvent('selectedchange'));
      this.requestUpdate();
    }
  }

  /**
   * A handler for the tab close icon click. Closes a tab and selects the first in the queue available.
   * @param {Event} e
   */
  [tabCloseHandler](e) {
    const node = /** @type HTMLDivElement */ (e.currentTarget);
    const { id } = node.dataset;
    const index = this[openedTabs].indexOf(id);
    this[openedTabs].splice(index, 1);
    this.dispatchEvent(new CustomEvent('activechange'));
    if (id !== this[selectedTab]) {
      // other than the current is selected
      this.requestUpdate();
      return;
    }
    let item = this[openedTabs][index - 1];
    if (!item) {
      [item] = this[openedTabs];
    }
    if (!item) {
      this[selectedTab] = '';
    } else {
      this[selectedTab] = item;
    }
    this.dispatchEvent(new CustomEvent('selectedchange'));
    this.requestUpdate();
  }

  [clearResponseHandler]() {
    this.request = undefined;
    this.response = undefined
  }

  /**
   * @param {number} code The status code to test for classes.
   * @returns {object} List of classes to be set on the status code
   */
  [computeStatusClasses](code) {
    const classes = {
      code: true,
      error: code >= 500 || code === 0,
      warning: code >= 400 && code < 500,
      info: code >= 300 && code < 400,
    };
    return classes;
  }

  /**
   * Extracts the location URL form the headers.
   *
   * @param {string} headers A HTTP headers string.
   * @return {string} A value of the location header or `unknown` if not found.
   */
  [computeRedirectLocation](headers) {
    const def = 'unknown';
    if (!headers || typeof headers !== 'string') {
      return def;
    }
    const match = headers.match(/^location: (.*)$/im);
    if (!match) {
      return def;
    }
    const link = match[1];
    const value = link.match(/<(.+?)>/);
    if (value) {
      return value[1];
    }
    return '';
  }

  /**
   * Dispatches file save event with the payload.
   */
  async [saveResponseFile]() {
    const { headers, payload } = this.response;
    if (!payload || !headers) {
      return;
    }
    const [contentType] = readContentType(headers);
    let ext = MimeTypes[contentType];
    if (!ext) {
      ext = '.txt';
    }
    const file = `response-body${ext}`;
    ExportEvents.fileSave(this, payload, {
      contentType,
      file,
    });
  }

  /**
   * Writes the current body to the clipboard
   */
  async [copyResponseClipboard]() {
    const { payload } = this.response;
    const body = readBodyString(payload);
    await navigator.clipboard.writeText(body);
  }

  /**
   * A handler for the click event in the response panel
   * @param {CustomEvent} e
   */
  [redirectLinkHandler](e) {
    const node = /** @type HTMLAnchorElement */ (e.target);
    if (node.nodeName !== 'A') {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const url = node.href;
    WorkspaceEvents.appendRequest(this, {
      url,
      method: 'GET',
    });
  }

  render() {
    return html`
    ${this[responseTabsTemplate]()}
    ${this[tabContentTemplate]()}
    `;
  }

  [responseTabsTemplate]() {
    const selected = this[selectedTab];
    const currentList = this[openedTabs];
    const toRender = availableTabs.filter((info) => currentList.includes(info.id));
    return html`
    <div class="tabs">
      ${this[tabMenu]()}
      ${toRender.map((info) => this[tabItem](info, info.id === selected))}
      ${this[clearResponseTemplate]()}
    </div>
    `;
  }

  /**
   * Renders a tab element
   * @param {*} info
   * @param {boolean} selected
   * @returns {TemplateResult} A template for a tab item
   */
  [tabItem](info, selected) {
    const classes = {
      tab: true,
      selected,
    };
    return html`
    <div class=${classMap(classes)} data-id="${info.id}" @click="${this[tabClickHandler]}">
      <span class="tab-label">${info.label}</span>
      <arc-icon icon="close" class="tab-close" data-id="${info.id}" @click="${this[tabCloseHandler]}"></arc-icon>
    </div>
    `;
  }

  /**
   * Renders a tab dropdown menu element
   * @returns {TemplateResult} A template for the tabs context menu with available tabs
   */
  [tabMenu]() {
    return html`
    <anypoint-menu-button
      closeOnActivate
      @activate="${this[tabSelectHandler]}"
      class="tabs-menu"
    >
      <anypoint-icon-button slot="dropdown-trigger">
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox slot="dropdown-content" attrForSelected="data-id">
      ${availableTabs.map((item) => html`<anypoint-item data-id="${item.id}">${item.label}</anypoint-item>`)}
      </anypoint-listbox>
    </anypoint-menu-button>
    `;
  }

  /**
   * @returns {TemplateResult} A template for the empty response screen.
   */
  [emptyResponseScreenTemplate]() {
    return html`
    <div class="empty-screen">
      <b>No response recorded</b><br/>
      <p>Send a request to see the response.</p>
    </div>
    `;
  }

  [clearResponseTemplate]() {
    return html`
    <anypoint-button
      ?disabled="${!this.hasResponse}"
      @click="${this[clearResponseHandler]}"
      class="clear-button"
      title="Clear the response"
    >Clear</anypoint-button>
    `;
  }

  [tabContentTemplate]() {
    if (this[openedTabs].length === 0) {
      return html`<div class="empty-background"></div>`;
    }
    if (!this.hasResponse) {
      return this[emptyResponseScreenTemplate]();
    }
    const selected = this[selectedTab];
    return html`
    ${this[openedTabs].map((id) => this[tabTemplate](id, selected === id))}
    `;
  }

  /**
   * Renders a tab by given id.
   * @param {string} id The id of the tab to render
   * @param {boolean} selected Whether it's a current selected tab
   */
  [tabTemplate](id, selected) {
    switch (id) {
      case 'response': return this[responseTemplate](selected);
      case 'timings': return this[timingsTemplate](selected);
      case 'headers': return this[detailsTemplate](selected);
      case 'redirects': return this[redirectsTemplate](selected);
      default: return this[unknownTemplate](selected);
    }
  }

  /**
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A template for the response visualization
   */
  [responseTemplate](opened) {
    const info = /** @type Response */ (this.response);
    const { status, statusText, payload, size, loadingTime, headers } = info;
    const typedError = /** @type ErrorResponse */ (this.response);
    const isError = !!typedError.error;
    return html`
    <div class="panel" ?hidden="${!opened}">
      <div class="response-meta">
        ${this[statusLabel](status, statusText)}
        ${this[loadingTimeTemplate](loadingTime)}
        ${this[responseSizeTemplate](size)}
        ${this[responseOptionsTemplate]()}
      </div>
      ${isError ? this[errorResponse](typedError.error) : this[responseBodyTemplate](payload, headers, opened)}
    </div>`;
  }

  /**
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A template for the headers panel.
   */
  [detailsTemplate](opened) {
    return html`
    <div class="panel" ?hidden="${!opened}">
      ${this[urlStatusTemplate]()}
      ${this[responseHeadersTemplate]()}
      ${this[requestHeadersTemplate]()}
    </div>`;
  }

  /**
   * @returns {TemplateResult|string} A template for the request headers, if any.
   */
  [requestHeadersTemplate]() {
    const info = /** @type TransportRequest */ (this.request);
    if (!info) {
      return '';
    }
    const { httpMessage, headers } = info;
    const headersOpened = !!headers;
    return html`
    <details ?open="${headersOpened}">
      <summary>Request headers</summary>
      ${headers ? html`<headers-list class="summary-content" .headers="${headers}"></headers-list>` : html`<p class="summary-content">There are no recorded request headers</p>`}
    </details>
    ${httpMessage ? html`
    <details>
      <summary>Sent message</summary>
      <pre class="summary-content"><code>${httpMessage}</code></pre>
    </details>` : ''}
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the url info in the headers panel
   */
  [urlStatusTemplate]() {
    const info = /** @type TransportRequest */ (this.request);
    if (!info) {
      return '';
    }
    const { method, url, } = info;
    return html`
    <div class="status-url">
      <span class="http-method">${method}</span><span class="request-url">${url}</span>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} A template for the response headers, if any.
   */
  [responseHeadersTemplate]() {
    const info = /** @type Response */ (this.response);
    if (!info) {
      return '';
    }
    const { headers } = info;
    const opened = !!headers;
    return html`
    <details ?open="${opened}">
      <summary>Response headers</summary>
      ${headers ? html`<headers-list class="summary-content" .headers="${headers}"></headers-list>` : html`<p class="summary-content">There are no recorded response headers</p>`}
    </details>
    `;
  }

  /**
   * @param {boolean} opened Whether the panel is currently rendered in the view
   * @returns {TemplateResult|string} A detailed information about redirects
   */
  [redirectsTemplate](opened) {
    const info = /** @type Response */ (this.response);
    if (!info) {
      return '';
    }
    const { redirects } = info;
    const hasRedirects = Array.isArray(redirects) && !!redirects.length;
    return html`
    <div class="panel" ?hidden="${!opened}">
      ${hasRedirects ? 
        redirects.map((item, i) => this[redirectItemTemplate](item, i)) : 
        html`
        <div class="empty-info">
          <p>This request has no redirect information</p>
        </div>
        `
      }
    </div>`;
  }

  /**
   * @param {boolean} opened Whether the template is currently rendered
   * @returns {TemplateResult} A template for the request timings.
   */
  [timingsTemplate](opened) {
    const info = /** @type Response */ (this.response);
    const { redirects, timings } = info;
    if (!timings) {
      return html`
        <div class="panel" ?hidden="${!opened}">
          <div class="empty-info">
            <p>This request has no timing information</p>
          </div>
        </div>
      `;
    }
    let startTime
    const requestInfo = /** @type TransportRequest */ (this.request);
    if (requestInfo) {
      startTime = requestInfo.startTime;
    }
    return html`
    <div class="panel" ?hidden="${!opened}">
      <request-timings-panel .redirects="${redirects}" .startTime="${startTime}" .timings="${timings}"></request-timings-panel>
    </div>`;
  }

  /**
   * @param {boolean} opened Whether the template is currently rendered
   * @returns {TemplateResult} A template for the "unknown" state message
   */
  [unknownTemplate](opened) {
    return html`<div class="panel" ?hidden="${!opened}">unknown</div>`;
  }

  /**
   * @param {number} status The response status code
   * @param {string} statusText The response reason part of the status.
   * @returns {TemplateResult} Template for the status message
   */
  [statusLabel](status, statusText='') {
    const codeClasses = this[computeStatusClasses](status);
    return html`
    <div class="status-line">
      <span class="${classMap(codeClasses)}">${status}</span>
      <span class="message">${statusText}</span>
    </div>`;
  }

  /**
   * @param {number} value The response loading time
   * @returns {TemplateResult|string} Template for the loading time message
   */
  [loadingTimeTemplate](value) {
    if (Number.isNaN(value)) {
      return '';
    }
    return html`<span class="loading-time-label">Time: ${value || 0} ms</span>`;
  }

  /**
   * @param {RequestsSize} size The response size value
   * @returns {TemplateResult|string} Template for the response size
   */
  [responseSizeTemplate](size) {
    if (!size || Number.isNaN(size.response)) {
      return '';
    }
    return html`<span class="response-size-label">Size: ${bytesToSize(size.response)}</span>`;
  }

  /**
   * @returns {TemplateResult} A template for response options drop down
   */
  [responseOptionsTemplate]() {
    return html`
    <anypoint-menu-button
      closeOnActivate
      @activate="${this[contentActionHandler]}"
      class="request-menu"
    >
      <anypoint-icon-button slot="dropdown-trigger">
        <arc-icon icon="moreVert"></arc-icon>
      </anypoint-icon-button>
      <anypoint-listbox slot="dropdown-content" attrForSelected="data-id">
        <anypoint-icon-item data-id="save">
          <arc-icon icon="archive" slot="item-icon"></arc-icon> Save to file
        </anypoint-icon-item>
        <anypoint-icon-item data-id="copy">
          <arc-icon icon="contentCopy" slot="item-icon"></arc-icon> Copy to clipboard
        </anypoint-icon-item>
      </anypoint-listbox>
    </anypoint-menu-button>`;
  }

  /**
   * @param {string|Buffer|ArrayBuffer} payload The response payload
   * @param {string} headers The response headers
   * @param {boolean} opened True when the panel is currently rendered
   * @returns {TemplateResult} Template for the response preview
   */
  [responseBodyTemplate](payload, headers='', opened) {
    return html`
    <div class="response-wrapper">
      <response-body .body="${payload}" .headers="${headers}" .active="${opened}"></response-body>
    </div>
    `;
  }

  /**
   * @param {Error} error
   * @returns {TemplateResult} Template for the error response
   */
  [errorResponse](error) {
    return html`
    <div class="response-wrapper">
      ${error.message}
    </div>
    `;
  }

  /**
   * @param {ResponseRedirect} item
   * @param {number} index
   * @returns {TemplateResult} A template for a single redirection item
   */
  [redirectItemTemplate](item, index) {
    const { response } = item;
    const { status, statusText, headers, payload } = response;
    const codeClasses = this[computeStatusClasses](status);
    const loc = /** @type string */ (this[computeRedirectLocation](headers));
    const mime = payload ? readContentType(headers) : undefined;
    const body = payload ? readBodyString(payload) : undefined;
    return html`
    <div class="status-row">
      <div class="status-label text">#<span>${index + 1}</span></div>
      <div class="redirect-value" @click="${this[redirectLinkHandler]}">
        <div class="redirect-code">
          <span class="${classMap(codeClasses)}">${status} ${statusText}</span>
        </div>
        <div class="redirect-location">
          <a href="${loc}" class="auto-link">${loc}</a>
        </div>
        ${headers ? html`<headers-list .headers="${headers}"></headers-list>` : html`<p class="summary-content">There are no recorded response headers</p>`}
        ${body ? html`<response-highlight .code="${body}" .lang="${mime[0]}"></response-highlight>` : ''}
      </div>
    </div>
    `;
  }
}