# Deprecated

This component is deprecated. Use `@advanced-rest-client/app` instead.

----

A module containing the UI regions and the logic to render and support HTTP response in Advanced REST Client.

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/arc-response.svg)](https://www.npmjs.com/package/@advanced-rest-client/arc-response)

[![Tests and publishing](https://github.com/advanced-rest-client/arc-response/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/arc-response/actions/workflows/deployment.yml)

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/arc-response
```

## request-timings and request-timings-panel

An element to render request timings information from HAR 1.2  timings object. The "panel" element renders a series of timings, including redirects.

### Example

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/arc-response/request-timings.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <request-timings .timings="${this.har}"></request-timings>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## response-view

The main response view for the Advanced REST Client. It takes the ARC `request` object with the transport request data and the response data set on the element to generate the view from the data.
The request and response objects types are defined in [arc-types](https://github.com/advanced-rest-client/arc-types) as `ArcRequest.TransportRequest` and `ArcResponse.Response`.

## response-body

An element to render the response visualization matched its content type header of the response.
In most cases it renders highlighted code via PrismJS. In some cases it renders specialized view
for PDF, binary, and image files.

## response-highlight

An element that performs syntax highlighting for the current body.

## Development

```sh
git clone https://github.com/advanced-rest-client/arc-response
cd arc-response
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```
