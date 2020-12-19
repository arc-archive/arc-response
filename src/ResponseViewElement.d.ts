import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { ArcResponse, ArcRequest } from '@advanced-rest-client/arc-types';
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
  tabsKeyDownHandler,
} from './internals.js';

export declare interface ResponsePanel {
  id: string;
  label: string;
}

export const availableTabs: ResponsePanel[];

/**
 * @fires activechange When a list of active panels change
 * @fires selectedchange When a list of active panels change
 * @fires clear Dispatched when the user press the `clear` button.
 */
export declare class ResponseViewElement extends LitElement {
  static readonly styles: CSSResult;

  /**
   * ARC HTTP response object
   */
  response: ArcResponse.Response | ArcResponse.ErrorResponse;
  /** 
   * ARC HTTP request object
   */
  request: ArcRequest.TransportRequest;
  /** 
   * A list of active panels (in order) rendered in the tabs.
   */
  active: string[];
  /** 
   * The currently selected panel
   * @attribute
   */
  selected: string;
  /** 
   * Adds a compatibility with Anypoint styling
   * @attribute
   */
  compatibility: string;
  /**
   * The size of a response that triggers "raw" view by default.
   * @attribute
   */
  forceRawSize?: number;
  /**
   * The size of a response, in KB, that triggers warning message instead of showing the response.
   * @attribute
   */
  warningResponseMaxSize?: number;

  /**
   * Tests whether the response is set
   */
  readonly hasResponse: boolean;

  [selectedTab]: string;
  [openedTabs]: string[];

  constructor();

  /**
   * A handler for the tab selection. It activates a tab, if necessary.
   * @param {CustomEvent} e
   */
  [tabSelectHandler](e: CustomEvent): Promise<void>;

  /**
   * A handler for the content action drop down item selection
   */
  [contentActionHandler](e: CustomEvent): Promise<void>;

  /**
   * A handler for the tab name click. Selects a tab.
   */
  [tabClickHandler](e: Event): void;

  /**
   * A handler for the tab close icon click. Closes a tab and selects the first in the queue available.
   */
  [tabCloseHandler](e: Event): void;

  /**
   * Adds a11y support for the tabs to move between the tabs on right - left arrow
   */
  [tabsKeyDownHandler](e: KeyboardEvent): void;

  [clearResponseHandler](): void;

  /**
   * @param code The status code to test for classes.
   * @returns List of classes to be set on the status code
   */
  [computeStatusClasses](code: number): object;

  /**
   * Extracts the location URL form the headers.
   *
   * @param headers A HTTP headers string.
   * @return A value of the location header or `unknown` if not found.
   */
  [computeRedirectLocation](headers: string): string;

  /**
   * Dispatches file save event with the payload.
   */
  [saveResponseFile](): Promise<void>;

  /**
   * Writes the current body to the clipboard
   */
  [copyResponseClipboard](): Promise<void>;

  /**
   * A handler for the click event in the response panel
   */
  [redirectLinkHandler](e: CustomEvent): void;

  render(): TemplateResult;

  [responseTabsTemplate](): TemplateResult;

  /**
   * Renders a tab element
   * @param info
   * @param selected
   * @returns A template for a tab item
   */
  [tabItem](info: ResponsePanel, selected: boolean): TemplateResult;

  /**
   * Renders a tab dropdown menu element
   * @returns {TemplateResult} A template for the tabs context menu with available tabs
   */
  [tabMenu](): TemplateResult;

  /**
   * @returns {TemplateResult} A template for the empty response screen.
   */
  [emptyResponseScreenTemplate](): TemplateResult;

  [clearResponseTemplate](): TemplateResult;

  [tabContentTemplate](): TemplateResult;

  /**
   * Renders a tab by given id.
   * @param id The id of the tab to render
   * @param selected Whether it's a current selected tab
   */
  [tabTemplate](id: string, selected: boolean): TemplateResult;

  /**
   * @param id The id of the tab to render
   * @param opened Whether the panel is currently rendered in the view
   * @returns A template for the response visualization
   */
  [responseTemplate](id: string, opened: boolean): TemplateResult|string;

  /**
   * @param opened Whether the panel is currently rendered in the view
   * @returns A template for the headers panel.
   */
  [detailsTemplate](id: string, opened: boolean): TemplateResult|string;

  /**
   * @returns A template for the request headers, if any.
   */
  [requestHeadersTemplate](): TemplateResult|string;

  /**
   * @returns A template for the url info in the headers panel
   */
  [urlStatusTemplate](): TemplateResult|string;

  /**
   * @returns A template for the response headers, if any.
   */
  [responseHeadersTemplate](): TemplateResult|string;

  /**
   * @param opened Whether the panel is currently rendered in the view
   * @returns A detailed information about redirects
   */
  [redirectsTemplate](id: string, opened: boolean): TemplateResult|string;

  /**
   * @param opened Whether the template is currently rendered
   * @returns A template for the request timings.
   */
  [timingsTemplate](id: string, opened: boolean): TemplateResult;

  /**
   * @param opened Whether the template is currently rendered
   * @returns A template for the "unknown" state message
   */
  [unknownTemplate](opened: boolean): TemplateResult;

  /**
   * @param status The response status code
   * @param statusText The response reason part of the status.
   * @returns Template for the status message
   */
  [statusLabel](status: number, statusText?: string): TemplateResult;

  /**
   * @param value The response loading time
   * @returns Template for the loading time message
   */
  [loadingTimeTemplate](value: number): TemplateResult|string;

  /**
   * @param size The response size value
   * @returns Template for the response size
   */
  [responseSizeTemplate](size: ArcResponse.RequestsSize): TemplateResult|string;

  /**
   * @returns A template for response options drop down
   */
  [responseOptionsTemplate](): TemplateResult;

  /**
   * @param payload The response payload
   * @param headers The response headers
   * @param opened True when the panel is currently rendered
   * @returns Template for the response preview
   */
  [responseBodyTemplate](payload: string|Buffer|ArrayBuffer, headers: string, opened: boolean): TemplateResult;

  /**
   * @returns Template for the error response
   */
  [errorResponse](error: Error): TemplateResult;

  /**
   * @param item
   * @param index
   * @returns A template for a single redirection item
   */
  [redirectItemTemplate](item: ArcResponse.ResponseRedirect, index: number): TemplateResult;
}
