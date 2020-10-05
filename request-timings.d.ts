import { RequestTimingsElement } from './src/RequestTimingsElement';

declare global {
  interface HTMLElementTagNameMap {
    "request-timings": RequestTimingsElement;
  }
}
