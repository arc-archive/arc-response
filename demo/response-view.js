import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import { HeadersParser } from '@advanced-rest-client/arc-headers';
import { DataExportEventTypes } from '@advanced-rest-client/arc-events';
import { DataGenerator, HeadersGenerator } from '@advanced-rest-client/arc-data-generator';
import '../response-view.js';

/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.ResponseRedirect} ResponseRedirect */
/** @typedef {import('@advanced-rest-client/arc-events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */

const selectedPanelKey = 'demo.responseView.selectedPanel';
const activePanelsKey = 'demo.responseView.activePanels';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties(['response', 'request']);
    this.componentName = 'response-view';
    this.demoStates = ['Regular'];
    this.renderViewControls = true;
    this.compatibility = false;
    this.response = undefined;
    this.request = undefined;
    this.panels = undefined;
    this.selected = undefined;
    this.generator = new DataGenerator();

    this.restoreLocal();

    this.urlKeyHandler = this.urlKeyHandler.bind(this);
    this.selectedPanelHandler = this.selectedPanelHandler.bind(this);
    this.activePanelsHandler = this.activePanelsHandler.bind(this);
    this.generateRequest = this.generateRequest.bind(this);
    this.panelClear = this.panelClear.bind(this);

    this.url = '';
    // this.url = window.location.href;
    // this.url = 'https://xd.adobe.com/view/46b6a75a-0dfd-44ff-87c1-e1b843d03911-13e5/';
    // this.url = 'https://httpbin.org/brotli';
    // this.url = 'json.json';
    window.addEventListener(DataExportEventTypes.fileSave, this.fileSaveHandler.bind(this))
  }

  /** 
   * @param {ArcExportFilesystemEvent} e
   */
  fileSaveHandler(e) {
    const { data, providerOptions  } = e;
    const a = document.createElement('a');
    const blob = new Blob([data], { type: providerOptions.contentType });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = providerOptions.file;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }

  /**
   * @param {KeyboardEvent} e
   */
  urlKeyHandler(e) {
    if (!['Enter', 'NumpadEnter'].includes(e.code)) {
      return;
    }
    const {value} = /** @type HTMLInputElement */ (e.target);
    this.makeRequest(value);
  }

  /**
   * @param {string} url
   */
  async makeRequest(url) {
    const startTime = Date.now();
    const request = /** @type TransportRequest */ ({
      url,
      method: 'GET',
      startTime,
      endTime: 0,
      httpMessage: 'Not available',
    });
    try {
      const response = await fetch(url, {
        redirect: "manual",
      });
      const end = Date.now();
      const result = /** @type Response */ ({
        startTime,
        loadingTime: end - startTime,
        status: response.status,
        statusText: response.statusText,
        headers: HeadersParser.toString(response.headers),
        payload: undefined,
      });
      const body = await response.arrayBuffer();
      result.size = {
        request: 10,
        response: body.byteLength,
      };
      result.payload = body;
      this.response = result;
    } catch (e) {
      const end = Date.now();
      this.response = /** @type ErrorResponse */({
        error: e,
        status: 0,
        startTime,
        loadingTime: end - startTime,
        headers: '',
        payload: undefined,
      });
    }
    request.endTime = Date.now();
    this.request = request;
  }

  selectedPanelHandler(e) {
    const { selected } = e.target;
    this.selected = selected;
    localStorage.setItem(selectedPanelKey, selected);
  }

  activePanelsHandler(e) {
    const { active } = e.target;
    this.panels = active;
    localStorage.setItem(activePanelsKey, JSON.stringify(active));
  }

  restoreLocal() {
    const activeValue = localStorage.getItem(activePanelsKey);
    if (activeValue) {
      try {
        this.panels = JSON.parse(activeValue);
      } catch (e) {
        // ..
      }
    }
    this.selected = localStorage.getItem(selectedPanelKey) || undefined;
  }

  generateRequest() {
    const r = this.generator.generateHistoryObject();
    this.request = /** @type TransportRequest */ ({
      url: r.url,
      method: r.method,
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      httpMessage: 'Not available',
      headers: HeadersGenerator.generateHeaders('request'),
    });
    this.response = this.generator.generateResponse({ timings: true, ssl: true, redirects: true,  });
  }

  panelClear() {
    console.log('clearing');
    this.response = undefined;
    this.request = undefined;
    this.render();
  }

  _demoTemplate() {
    const {
      response,
      request,
      panels,
      selected,
    } = this;
    console.log(response);
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <response-view
        slot="content"
        .response="${response}"
        .request="${request}"
        .selected="${selected}"
        .active="${panels}"
        @selectedchange="${this.selectedPanelHandler}"
        @activechange="${this.activePanelsHandler}"
        @clear="${this.panelClear}"
        class="scrolling-region"
      ></response-view>
    </section>
    `;
  }

  demoRequest() {
    return html`
    <section class="documentation-section">
      <h3>Demo request</h3>
      <input 
        type="url" 
        .value="${this.url}" 
        @keydown="${this.urlKeyHandler}" 
        class="url-input"
        list="inputOptions"
        aria-label="Enter the URL value"
      />
      <datalist id="inputOptions">
        <option value="json.json"></option>
        <option value="https://xd.adobe.com/view/46b6a75a-0dfd-44ff-87c1-e1b843d03911-13e5/"></option>
        <option value="${window.location.href}"></option>
        <option value="https://httpbin.org/brotli"></option>
        <option value="https://httpbin.org/bytes/1000"></option>
        <option value="https://httpbin.org/image/svg"></option>
        <option value="https://httpbin.org/status/404"></option>
      </datalist>
    </section>
    `;
  }

  generatorOptionsTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Generate request</h3>
      <anypoint-button @click="${this.generateRequest}">Generate</anypoint-button>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC response view</h2>
      ${this._demoTemplate()}
      ${this.demoRequest()}
      ${this.generatorOptionsTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
