# ARC response

A module containing the UI regions and the logic to render and support HTTP response in Advanced REST Client.

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/arc-response.svg)](https://www.npmjs.com/package/@advanced-rest-client/arc-response)

[![Build Status](https://travis-ci.com/advanced-rest-client/arc-response.svg)](https://travis-ci.com/advanced-rest-client/arc-response)

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/arc-response
```

## request-timings

An element to render request timings information from HAR 1.2  timings object

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
