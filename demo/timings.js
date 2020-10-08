import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
import '../request-timings.js';
import '../request-timings-panel.js';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'minimal',
    ]);
    this.componentName = 'request-timings-panel';
    this.demoStates = ['Regular'];
    this.renderViewControls = true;
    this.compatibility = false;
    this.minimal = false;
  }

  get fullTimings() {
    return {
      startTime: 1483368432132,
      blocked: 7.75,
      dns: 279.38,
      connect: 883.12,
      ssl: 633.05,
      send: 0.29,
      wait: 649.88,
      receive: 1.71
    };
  }

  get minimalTimings() {
    return {
      startTime: 1601862918077,
      connect: 883.12,
      send: 0.29,
      wait: 649.88,
      receive: 1.71
    };
  }

  get redirectTimings() {
    return [
      {
        startTime: '2017-01-02T16:22:26.212Z',
        blocked: 10.697000019718,
        dns: -1,
        connect: -1,
        send: 0.34099997719749986,
        wait: 155.50400002393852,
        receive: 4.751000029500744,
        ssl: -1
      },
      {
        startTime: '2017-01-02T16:22:26.212Z',
        blocked: 3.36500001139939,
        dns: -1,
        connect: -1,
        send: 0.06499997107311994,
        wait: 138.7439999962225,
        receive: 4.986000014469084,
        ssl: -1
      }
    ];
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      minimal,
      narrow,
    } = this;
    const value = minimal ? this.minimalTimings : this.fullTimings;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <arc-interactive-demo
        .states="${demoStates}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <request-timings
          .timings="${value}"
          ?narrow="${narrow}"
          slot="content"
        ></request-timings>

        <label slot="options" id="mainOptionsLabel">Options</label>
        <anypoint-switch
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="minimal"
          @change="${this._toggleMainOption}"
        >
          Minimal value
        </anypoint-switch>
      </arc-interactive-demo>
    </section>
    `;
  }

  _panelTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Timings panel with redirects</h3>
      <request-timings-panel
        .timings="${this.fullTimings}"
        .redirects="${this.redirectTimings}"
        ?narrow="${this.narrow}"
      ></request-timings-panel>
    </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>ARC request timings view</h2>
      ${this._demoTemplate()}
      ${this._panelTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();