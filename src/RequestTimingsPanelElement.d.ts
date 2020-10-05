import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { ArcResponse } from '@advanced-rest-client/arc-types';
import { readTimingValue, computeHarTime, computeRequestTime, redirectsTableTemplate, timingsTemplate, timingItemTemplate } from './internals.js';

/**
 * An element to render a set of ARC HAR timings.
 */
export class RequestTimingsPanelElement extends LitElement {
  static readonly styles: CSSResult;

  /**
   * An array of HAR 1.2 timings object.
   * It describes a timings for any redirect occurrence during the request.
   * The list should should be ordered by the occurrence time.
   */
  redirects: ArcResponse.RequestTimings[];
  /** 
   * The main request HAR timings.
   */
  timings: ArcResponse.RequestTimings;
  /**
   * When set it renders mobile friendly view
   * @attribute
   */
  narrow: boolean;

  /**
   * Tests whether redirects list has been set
   */
  readonly hasRedirects: boolean;

  constructor();

  /**
   * @param redirects The timings of the redirects
   * @param timings The timings of the final request
   * @returns The total request time
   */
  [computeRequestTime](redirects: ArcResponse.RequestTimings[], timings: ArcResponse.RequestTimings): number;

  /**
   * Reads a numeric value
   * @param value The input value
   * @param defValue The default value to return when the input is an invalid number.
   * @returns A positive integer value
   */
  [readTimingValue](value: number, defValue?: number): number;

  /**
   * @param har The timings object
   * @returns The total request time
   */
  [computeHarTime](har: ArcResponse.RequestTimings): number;

  render(): TemplateResult;

  /**
   * @returns A template for the timings without redirects.
   */
  [timingsTemplate](): TemplateResult;

  /**
   * @returns A template for the timings with redirects.
   */
  [redirectsTableTemplate](): TemplateResult;

  /**
   * @param item A redirect timings
   * @param index The index in the redirects array
   * @returns A template for a single table
   */
  [timingItemTemplate](item: ArcResponse.RequestTimings, index: number): TemplateResult;
}