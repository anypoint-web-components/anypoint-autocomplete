import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import 'chance/chance.js';
import '../anypoint-autocomplete.js';

/* eslint-disable no-plusplus */

import usageTemplate from './uageTemplate.js';
import usabilityTemplate from './usabilityTemplate.js';
import introTemplate from './introTemplate.js';

const suggestions = ['Apple', 'Apricot', 'Avocado',
  'Banana', 'Bilberry', 'Blackberry', 'Blackcurrant', 'Blueberry',
  'Boysenberry', 'Cantaloupe', 'Currant', 'Cherry', 'Cherimoya',
  'Cloudberry', 'Coconut', 'Cranberry', 'Damson', 'Date', 'Dragonfruit',
  'Durian', 'Elderberry', 'Feijoa', 'Fig', 'Goji berry', 'Gooseberry',
  'Grape', 'Grapefruit', 'Guava', 'Huckleberry', 'Jabuticaba', 'Jackfruit',
  'Jambul', 'Jujube', 'Juniper berry', 'Kiwi fruit', 'Kumquat', 'Lemon',
  'Lime', 'Loquat', 'Lychee', 'Mango', 'Marion berry', 'Melon', 'Miracle fruit',
  'Mulberry', 'Nectarine', 'Olive', 'Orange'
];

const fullSuggestions = [
  {
    value: 'apple',
    label: 'Apple',
    description: 'Select apple to be healthy',
  },
  {
    value: 'banana',
    label: 'Banana',
    description: 'Select banana for fun!',
  },
  {
    value: 'blueberry',
    label: 'Blueberry',
    description: 'Select blueberry to kill the hunger',
  },
];

/* global chance */

class ComponentDemo extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'demoOutlined',
      'demoCompatibility',
      'demoNoink',
      'demoUseLoader',
      'demoNoAnimation',
      'complexSuggestions'
    ]);
    this._mainDemoStateHandler = this._mainDemoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._demoQuery = this._demoQuery.bind(this);

    this._componentName = 'anypoint-autocomplete';
    this.demoStates = ['Contained', 'Outlined', 'Anypoint'];
    this.demoUseLoader = false;
    this.darkThemeActive = false;
    this.demoNoink = false;
    this.demoNoAnimation = false;
    this.complexSuggestions = false;
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _mainDemoStateHandler(e) {
    const state = e.detail.value;
    this.demoOutlined = state === 1;
    this.demoCompatibility = state === 2;
  }

  _demoQuery(e) {
    if (!this.demoUseLoader) {
      return;
    }
    const { value } = e.detail;
    setTimeout(() => {
      const items = [];
      for (let i = 0; i < 25; i++) {
        // @ts-ignore
        const item = `${value} ${chance.word()}`;
        items.push({
          label: html`HTML value: <b>${item}</b>`,
          value: item,
        });
      }
      e.target.source = items;
    }, 700);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      demoOutlined,
      demoCompatibility,
      demoNoink,
      demoUseLoader,
      demoNoAnimation,
      complexSuggestions,
    } = this;

    const items = complexSuggestions ? fullSuggestions : suggestions;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the autocomplete element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._mainDemoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <div role="combobox"
            slot="content"
            aria-label="Input field with list suggestions">
            <anypoint-input
              ?outlined="${demoOutlined}"
              ?compatibility="${demoCompatibility}"
              id="fruitsSuggestions1"
              >
              <label slot="label">Enter fruit name</label>
            </anypoint-input>

            <anypoint-autocomplete
              slot="content"
              openonfocus
              target="fruitsSuggestions1"
              ?outlined="${demoOutlined}"
              ?compatibility="${demoCompatibility}"
              ?noink="${demoNoink}"
              ?noAnimations="${demoNoAnimation}"
              ?loader="${demoUseLoader}"
              .source="${items}"
              @query="${this._demoQuery}">
            </anypoint-autocomplete>
          </div>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="demoNoink"
            @change="${this._toggleMainOption}"
            >No ink</anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="demoNoAnimation"
            @change="${this._toggleMainOption}"
            >No animation</anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="demoUseLoader"
            @change="${this._toggleMainOption}"
            >Async suggestions</anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="complexSuggestions"
            @change="${this._toggleMainOption}"
            >Use complex suggestions</anypoint-checkbox>
        </arc-interactive-demo>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Anypoint Autocomplete</h2>
      ${this._demoTemplate()}
      ${introTemplate}
      ${usageTemplate}
      ${usabilityTemplate}
    `;
  }
}
const instance = new ComponentDemo();
instance.render();
