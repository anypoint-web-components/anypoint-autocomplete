/*
Copyright 2019 Pawel Psztyc, The ARC team

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
import { LitElement, html, css } from 'lit-element';
import '@anypoint-web-components/anypoint-dropdown/anypoint-dropdown.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-progress/paper-progress.js';

/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

/** @typedef {import('./AnypointAutocomplete').Suggestion} Suggestion */
/** @typedef {import('./AnypointAutocomplete').InternalSuggestion} InternalSuggestion */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * Generates an id on passed element.
 * @param {HTMLElement} target An element to set id on to
 */
function ensureNodeId(target) {
  if (target.id) {
    return;
  }
  const id = Math.floor(Math.random() * 100000 + 1);
  target.id = `anypointAutocompleteInput${id}`;
}

export const suggestionsValue = Symbol('suggestionsValue');
export const processSource = Symbol('processSource');
export const normalizeSource = Symbol('normalizeSource');
export const itemTemplate = Symbol('itemTemplate');
export const readLabelValue = Symbol('readLabelValue');
export const rippleTemplate = Symbol('rippleTemplate');
export const openedValue = Symbol('openedValue');
export const openedValuePrivate = Symbol('openedValuePrivate');
export const autocompleteFocus = Symbol('autocompleteFocus');

/**
 * # `<paper-autocomplete>`
 *
 * @customElement
 * @demo demo/index.html
 */
export class AnypointAutocomplete extends LitElement {
  get styles() {
    return css`.highlight {
      font-weight: bold;
    }`;
  }

  createRenderRoot() {
    return this;
  }

  static get properties() {
    return {
      /**
       * A target input field to observe.
       * It accepts an element which is the input with `value` property or
       * an id of an element that is a child of the parent element of this node.
       */
      target: {},
      /**
       * List of suggestions to render.
       * If the array items are strings they will be used to render a suggestions and
       * to insert a value.
       * If the list is an object the each object must contain `value` and `display`
       * properties.
       * The `display` property will be used in the suggestions list and the
       * `value` property will be used to insert the value to the referenced text field.
       */
      source: { type: Array },
      /**
       * List of suggestion that are rendered.
       */
      _suggestions: { type: Array },
      /**
       * True when user query changed and waiting for `source` property update
       */
      _loading: { type: Boolean },
      /**
       * Set this to true if you use async operation in response for query event.
       * This will render a loader when querying for more suggestions.
       * Do not use it it you do not handle suggestions asynchronously.
       */
      loader: { type: Boolean, reflect: true },
      /**
       * If true it will opend suggestions on input field focus.
       */
      openOnFocus: { type: Boolean },
      /**
       * The orientation against which to align the element vertically
       * relative to the text input.
       * Possible values are "top", "bottom", "middle", "auto".
       */
      verticalAlign: { type: String },
      /**
       * A pixel value that will be added to the position calculated for the
       * given `verticalAlign`, in the direction of alignment. You can think
       * of it as increasing or decreasing the distance to the side of the
       * screen given by `verticalAlign`.
       *
       * If `verticalAlign` is "top" or "middle", this offset will increase or
       * decrease the distance to the top side of the screen: a negative offset
       * will move the dropdown upwards; a positive one, downwards.
       *
       * Conversely if `verticalAlign` is "bottom", this offset will increase
       * or decrease the distance to the bottom side of the screen: a negative
       * offset will move the dropdown downwards; a positive one, upwards.
       */
      verticalOffset: { type: Number },
      /**
       * The orientation against which to align the element horizontally
       * relative to the text input. Possible values are "left", "right",
       * "center", "auto".
       */
      horizontalAlign: { type: String },
      /**
       * A pixel value that will be added to the position calculated for the
       * given `horizontalAlign`, in the direction of alignment. You can think
       * of it as increasing or decreasing the distance to the side of the
       * screen given by `horizontalAlign`.
       *
       * If `horizontalAlign` is "left" or "center", this offset will increase or
       * decrease the distance to the left side of the screen: a negative offset
       * will move the dropdown to the left; a positive one, to the right.
       *
       * Conversely if `horizontalAlign` is "right", this offset will increase
       * or decrease the distance to the right side of the screen: a negative
       * offset will move the dropdown to the right; a positive one, to the left.
       */
      horizontalOffset: { type: Number },
      /**
       * Determines which action to perform when scroll outside an opened overlay
       * happens. Possible values: lock - blocks scrolling from happening, refit -
       * computes the new position on the overlay cancel - causes the overlay to
       * close
       */
      scrollAction: { type: String },
      /**
       * Removes animation from the dropdown.
       */
      noAnimations: { type: Boolean },
      /**
       * Removes ripple effect from list items.
       * This effect is always disabled when `compatibility` is set.
       */
      noink: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean, reflect: true },
      /**
       * @deprecated Use `compatibility` instead
       */
      legacy: { type: Boolean },
      /**
       * When set it won't setup `aria-controls` on target element.
       */
      noTargetControls: { type: Boolean },
      /**
       * When set the element won't update the `value` property on the
       * target when a selection is made.
       */
      noTargetValueUpdate: { type: Boolean },
    };
  }

  get target() {
    return this._target;
  }

  set target(value) {
    const old = this._target;
    if (old === value) {
      return;
    }
    this._target = value;
    this._targetChanged();
  }

  /**
   * @return {string[]|InternalSuggestion[]} List of suggestion that are rendered.
   */
  get suggestions() {
    return this._suggestions;
  }

  /**
   * @return {boolean} True when user query changed and waiting for `source` property update
   */
  get loading() {
    return this._loading;
  }

  get _loading() {
    return this.__loading;
  }

  set _loading(value) {
    const old = this.__loading;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.__loading = value;
    this.requestUpdate('_loading', value);
    this.dispatchEvent(
      new CustomEvent('loading-chanegd', {
        detail: {
          value
        }
      })
    );
  }

  get source() {
    return this._source;
  }

  set source(value) {
    const old = this._source;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._source = value;
    this[suggestionsValue] = this[processSource](value);
    if (this[openedValue]) {
      this._filterSuggestions();
    }
    if (this._loading) {
      this._loading = false;
    }
  }

  /**
   * @return {boolean} True if the overlay is currently opened.
   */
  get opened() {
    return this[openedValue];
  }

  get [openedValue]() {
    return this[openedValuePrivate] || false;
  }

  set [openedValue](value) {
    const old = this[openedValuePrivate];
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this[openedValuePrivate] = value;
    this.requestUpdate();
    this._openedChanged(value);
    this.dispatchEvent(
      new CustomEvent('opened-changed', {
        detail: {
          value
        }
      })
    );
  }

  get legacy() {
    return this.compatibility;
  }

  set legacy(value) {
    this.compatibility = value;
  }

  get compatibility() {
    return this._compatibility;
  }

  set compatibility(value) {
    const old = this._compatibility;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._compatibility = value;
    this.requestUpdate('compatibility', old);
  }

  get isAttached() {
    return this._isAttached;
  }

  set isAttached(value) {
    const old = this._isAttached;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._isAttached = value;
    this._targetChanged();
  }

  get _listbox() {
    if (!this.__listbox) {
      this.__listbox = this.querySelector('anypoint-listbox');
    }
    return this.__listbox;
  }

  /**
   * @return {EventListener} Previously registered handler for `query` event
   */
  get onquery() {
    return this._onquery;
  }

  /**
   * Registers a callback function for `query` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onquery(value) {
    if (this._onquery) {
      this.removeEventListener('query', this._onquery);
    }
    if (typeof value !== 'function') {
      this._onquery = null;
      return;
    }
    this._onquery = value;
    this.addEventListener('query', value);
  }

  /**
   * @return {EventListener} Previously registered handler for `selected` event
   */
  get onselected() {
    return this._onselected;
  }

  /**
   * Registers a callback function for `selected` event
   * @param {EventListener} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onselected(value) {
    if (this._onselected) {
      this.removeEventListener('selected', this._onselected);
    }
    if (typeof value !== 'function') {
      this._onselected = null;
      return;
    }
    this._onselected = value;
    this.addEventListener('selected', value);
  }

  constructor() {
    super();
    this._targetInputHandler = this._targetInputHandler.bind(this);
    this._targetFocusHandler = this._targetFocusHandler.bind(this);
    this._targetKeydown = this._targetKeydown.bind(this);

    this._suggestions = [];
    this._loading = false;
    this.loader = false;
    this.openOnFocus = false;
    this[openedValue] = false;
    this.horizontalAlign = 'center';
    this.verticalAlign = 'top';
    this.scrollAction = 'refit';
    this.horizontalOffset = 0;
    this.verticalOffset = 2;
    this.noTargetControls = false;
    this.noAnimations = false;
    this.noink = false;
    this.noTargetValueUpdate = false;
  }

  connectedCallback() {
    /* istanbul ignore else */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    ensureNodeId(this);
    this.style.position = 'absolute';
    this.isAttached = true;
  }

  disconnectedCallback() {
    /* istanbul ignore else */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.isAttached = false;
  }

  firstUpdated() {
    // Styles are defined here because it does not uses shadow root
    // to comply with accessibility requiremenets.
    // Styles defined in the component's `styles` getter won't be applied
    // to the children.
    const box = this._listbox;
    ensureNodeId(box);
    box.style.backgroundColor = 'var(--anypoiont-autocomplete-background-color, #fff)';
    box.style.boxShadow = 'var(--anypoiont-autocomplete-dropdown-shaddow)';
    const {id} = box;
    this.setAttribute('aria-owns', id);
    this.setAttribute('aria-controls', id);
    const target = this._oldTarget;
    if (!target || this.noTargetControls) {
      return;
    }
    target.setAttribute('aria-controls', id);
  }

  /**
   * Normalizes suggestions into a single struct.
   * @param {Array<string|Suggestion>|undefined|null} value A list of suggestions to process
   * @return {InternalSuggestion[]|null} Normalized suggestions
   */
  [processSource](value) {
    if (!Array.isArray(value)) {
      return null;
    }
    const result = [];
    value.forEach((item, index) => {
      const normalized = this[normalizeSource](item, index);
      if (normalized) {
        result.push(normalized);
      }
    });
    return result;
  }

  /**
   * Normalizes a suggestion
   * @param {Suggestion|string} value A list of suggestions to process
   * @param {number} index The index of the suggestion on the source list.
   * @return {InternalSuggestion|null} Normalized suggestions
   */
  [normalizeSource](value, index) {
    if (typeof value === 'string') {
      return { value, index };
    }
    if (!value.value) {
      return null;
    }
    return { ...value, index };
  }

  /**
   * Handler for target property change.
   */
  _targetChanged() {
    const { target, isAttached, _oldTarget } = this;
    if (_oldTarget) {
      _oldTarget.removeEventListener('input', this._targetInputHandler);
      _oldTarget.removeEventListener('focus', this._targetFocusHandler);
      _oldTarget.removeEventListener('keydown', this._targetKeydown);
      this._oldTarget = null;
    }
    if (!target || !isAttached) {
      return;
    }
    this.notifyResize();
    if (typeof target === 'string') {
      const parent = this.parentElement;
      if (!parent || !parent.querySelector) {
        return;
      }
      const node = parent.querySelector(`#${target}`);
      if (node) {
        this.target = node;

      }
    } else if (target) {
      target.addEventListener('input', this._targetInputHandler);
      target.addEventListener('focus', this._targetFocusHandler);
      target.addEventListener('keydown', this._targetKeydown);
      this._setupTargetAria(target);
      this._oldTarget = target;
      if (target === document.activeElement) {
        this._targetFocusHandler();
      }
    }
  }

  /**
   * Sets target input width on the listbox before rendering.
   */
  _setComboboxWidth() {
    const target = this._oldTarget;
    const box = this._listbox;
    if (!target || !box || !target.nodeType || target.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const { width } = rect;
    if (!width) {
      return;
    }
    box.style.width = `${width}px`;
  }

  /**
   * Setups relavent aria attributes in the target input.
   * @param {HTMLElement} target An element to set attribute on to
   */
  _setupTargetAria(target) {
    ensureNodeId(this);
    target.setAttribute('aria-autocomplete', 'list');
    target.setAttribute('autocomplete', 'off');
    target.setAttribute('aria-haspopup', 'true');
    // parent node of the input also should have aria attributes
    const parent = target.parentElement;
    if (!parent) {
      return;
    }
    parent.setAttribute('role', 'combobox');
    parent.setAttribute('aria-expanded', 'false');
    parent.setAttribute('aria-owns', this.id);
    parent.setAttribute('aria-haspopup', 'listbox');
    if (!parent.hasAttribute('aria-label') && !parent.hasAttribute('aria-labelledby')) {
      parent.setAttribute('aria-label', 'Text input with list suggestions');
    }
  }

  /**
   * Sets `aria-expanded` on input's parent element.
   * @param {boolean} opened
   */
  _openedChanged(opened) {
    const target = this._oldTarget;
    const parent = target && target.parentElement;
    if (!parent) {
      return;
    }
    parent.setAttribute('aria-expanded', String(opened));
  }

  /**
   * Renders suggestions on target's `input` event
   * @param {CustomEvent} e
   */
  _targetInputHandler(e) {
    if (e.detail) {
      // This event is dispatched by the autocomplete
      return;
    }
    this.renderSuggestions();
  }

  /**
   * Renders suggestions on target input focus if `openOnFocus` is set.
   */
  _targetFocusHandler() {
    if (!this.openOnFocus || this.opened || this[autocompleteFocus] || this.__ignoreNextFocus) {
      return;
    }
    this[autocompleteFocus] = true;
    setTimeout(() => {
      this[autocompleteFocus] = false;
      this.renderSuggestions();
    });
  }

  /**
   * Renders suggestions for current input and opens the overlay if
   * there are suggestions to show.
   */
  renderSuggestions() {
    if (!this.isAttached) {
      return;
    }
    let { value } = this._oldTarget;
    if (value === undefined || value === null) {
      value = '';
    }
    if (typeof value !== 'string') {
      value = String(value);
    }
    if (this._previousQuery && value.indexOf(this._previousQuery) === 0) {
      this._previousQuery = value;
      this._filterSuggestions();
      return;
    }
    this._listbox.selected = -1;
    this._disaptchQuery(value);
    this._previousQuery = value;
    this._filterSuggestions();
    if (this.loader) {
      this._loading = true;
      if (!this[openedValue]) {
        this._setComboboxWidth();
        this[openedValue] = true;
      }
    }
  }

  /**
   * Disaptches query event and returns it.
   * @param {String} value Current input value.
   * @return {CustomEvent}
   */
  _disaptchQuery(value) {
    const e = new CustomEvent('query', {
      detail: {
        value
      }
    });
    this.dispatchEvent(e);
    return e;
  }

  /**
   * Filter `source` array for current value.
   */
  _filterSuggestions() {
    if (!this._oldTarget || this._previousQuery === undefined) {
      return;
    }
    this._suggestions = [];
    const source = /** @type InternalSuggestion[] */ (this[suggestionsValue]);
    if (!source || !source.length) {
      this[openedValue] = false;
      return;
    }
    const query = this._previousQuery ? this._previousQuery.toLowerCase() : '';
    const filtered = this._listSuggestions(source, query);
    if (filtered.length === 0) {
      this[openedValue] = false;
      return;
    }
    filtered.sort((a, b) => {
      const valueA = String(a.value);
      const valueB = String(b.value);
      const lowerA = valueA.toLowerCase();
      const lowerB = valueB.toLowerCase();
      const aIndex = lowerA.indexOf(query);
      const bIndex = lowerB.indexOf(query);
      if (aIndex === bIndex) {
        return valueA.localeCompare(valueB);
      }
      if (aIndex === 0 && bIndex !== 0) {
        return -1;
      }
      if (bIndex === 0 && aIndex !== 0) {
        return 1;
      }
      if (valueA > valueB) {
        return 1;
      }
      if (valueA < valueB) {
        return -1;
      }
      return valueA.localeCompare(valueB);
    });
    this._suggestions = /** @type Suggestion[] */ (filtered);
    this.notifyResize();
    setTimeout(() => {
      if (!this.opened) {
        this._setComboboxWidth();
        this[openedValue] = true;
      }
    });
  }

  /**
   * Filters out suggestions
   * @param {InternalSuggestion[]} source Source suggestions (normalized)
   * @param {string} query Filter term
   * @return {InternalSuggestion[]} Filtered suggestions.
   */
  _listSuggestions(source, query) {
    if (!query && this.openOnFocus) {
      return source;
    }
    const filter = (item) => {
      const { value='' } = item;
      return String(value).toLowerCase().includes(query);
    };
    return source.filter(filter);
  }

  _closeHandler() {
    if (this[openedValue]) {
      this[openedValue] = false;
    }
  }

  notifyResize() {
    const node = this.querySelector('anypoint-dropdown');
    if (node) {
      // @ts-ignore
      node.notifyResize();
    }
  }

  _selectionHandler(e) {
    const { selected } = e.target;
    if (selected === -1 || selected === null || selected === undefined) {
      return;
    }
    this._selectSuggestion(selected);
  }

  /**
   * Inserts selected suggestion into the text box and closes the suggestions.
   * @param {number} selected Index of suggestion to use.
   */
  _selectSuggestion(selected) {
    // pick from the currently rendered suggestions, selected refers to this list
    const value = this._suggestions[selected];
    if (!value) {
      return;
    }
    const { target } = this;
    // The suggestion on the `_suggestions` is a subset of `[suggestionsValue]`
    // that has the `index` property, which refers to the index position on the source list.
    const sourceSuggestion = this.source[value.index];
    if (!sourceSuggestion) {
      // the source must have changed.
      return;
    }
    const result = String(value.value);

    if (!this.noTargetValueUpdate) {
      target.value = result;
      target.dispatchEvent(
        new CustomEvent('input', {
          detail: {
            autocomplete: this
          }
        })
      );
    }

    this[openedValue] = false;
    this._inform(sourceSuggestion);
    if (!this.__ignoreCloseRefocus) {
      this._refocusTarget();
    }
  }

  _refocusTarget() {
    this.__ignoreNextFocus = true;
    this.target.blur();
    this.target.focus();
    setTimeout(() => {
      this.__ignoreNextFocus = false;
    });
  }

  /**
   * Handler for the keydown event.
   * @param {KeyboardEvent} e
   */
  _targetKeydown(e) {
    if (e.key === 'ArrowDown') {
      this._onDownKey();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'ArrowUp') {
      this._onUpKey();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'Enter' || e.key === 'NumEnter') {
      this._onEnterKey();
    } else if (e.key === 'Tab') {
      this._onTabDown();
    } else if (e.key === 'Escape') {
      this._onEscKey();
    }
  }

  /**
   * If the dropdown is opened then it focuses on the first element on the list.
   * If closed it opens the suggestions and focuses on the first element on
   * the list.
   */
  _onDownKey() {
    if (!this[openedValue]) {
      this.renderSuggestions();
      setTimeout(() => {
        this._listbox.highlightNext();
      });
    } else {
      this._listbox.highlightNext();
    }
  }

  /**
   * If the dropdown is opened then it focuses on the last element on the list.
   * If closed it opens the suggestions and focuses on the last element on
   * the list.
   */
  _onUpKey() {
    if (!this[openedValue]) {
      this.renderSuggestions();
      setTimeout(() => {
        if (this[openedValue]) {
          this._listbox.highlightPrevious();
        }
      });
    } else {
      this._listbox.highlightPrevious();
    }
  }

  /**
   * Closes the dropdown.
   */
  _onEscKey() {
    this[openedValue] = false;
  }

  /**
   * Accetps first suggestion from the dropdown when opened.
   */
  _onEnterKey() {
    if (!this[openedValue]) {
      return;
    }
    const { _listbox: node } = this;
    const { highlightedItem } = node;
    if (highlightedItem) {
      const index = Number(node.indexOf(highlightedItem));
      if (!Number.isNaN(index) && index > -1) {
        this._selectSuggestion(index);
        return;
      }
    }
    this._selectSuggestion(0);
  }

  /**
   * The element refocuses on the input when suggestions closes.
   * Also, the lisbox element is focusable so with tab it can be next target.
   * Finally, the dropdown has close animation that takes some time to finish
   * so it will try to refocus after the animation finish.
   * This function sets flags in debouncer to prohibit this.
   */
  _onTabDown() {
    if (this[openedValue]) {
      this._listbox.tabIndex = -1;
      this.__ignoreNextFocus = true;
      this.__ignoreCloseRefocus = true;
      this[openedValue] = false;
      setTimeout(() => {
        this._listbox.tabIndex = 0;
        this.__ignoreNextFocus = false;
        this.__ignoreCloseRefocus = false;
      }, 300);
    }
  }

  /**
   * Dispatches `selected` event with new value.
   *
   * @param {string|Suggestion} value Selected value.
   */
  _inform(value) {
    const ev = new CustomEvent('selected', {
      detail: {
        value
      },
      cancelable: true
    });
    this.dispatchEvent(ev);
  }

  render() {
    const {
      _oldTarget,
      verticalAlign,
      horizontalAlign,
      scrollAction,
      horizontalOffset,
      verticalOffset,
      noAnimations,
      styles,
      compatibility,
    } = this;
    const offset = compatibility ? -2 : 0;
    const finalVerticalOffset = verticalOffset  + offset;
    return html`
    <style>${styles}</style>
    <anypoint-dropdown
      .positionTarget="${_oldTarget}"
      .verticalAlign="${verticalAlign}"
      .verticalOffset="${finalVerticalOffset}"
      .horizontalAlign="${horizontalAlign}"
      .horizontalOffset="${horizontalOffset}"
      .scrollAction="${scrollAction}"
      .opened="${this[openedValue]}"
      .noAnimations="${noAnimations}"
      noautofocus
      nooverlap
      nocancelonoutsideclick
      @overlay-closed="${this._closeHandler}"
    >
      ${this._listboxTemplate()}
    </anypoint-dropdown>
    `;
  }

  /**
   * @return {TemplateResult} Returns a template for the listbox
   */
  _listboxTemplate() {
    return html`
      <anypoint-listbox
        aria-label="Use arrows and enter to select list item. Escape to close the list."
        slot="dropdown-content"
        selectable="anypoint-item,anypoint-item-body"
        useariaselected
        @select="${this._selectionHandler}"
        ?compatibility="${this.compatibility}"
      >
        ${this._loaderTemplate()}
        ${this._listTemplate()}
      </anypoint-listbox>
    `;
  }

  /**
   * @return {TemplateResult|string} Returns a template for the progress bar
   */
  _loaderTemplate() {
    const { loader, _loading } = this;
    const _showLoader = !!loader && !!_loading;
    if (!_showLoader) {
      return '';
    }
    return html`<paper-progress style="width: 100%" indeterminate></paper-progress>`;
  }

  /**
   * @return {TemplateResult[]} Returns a template for the list item
   */
  _listTemplate() {
    const { _suggestions=[] } = this;
    return _suggestions.map((item) => this[itemTemplate](item));
  }

  /**
   * @param {Suggestion} item A suggestion to render
   * @return {TemplateResult|string} Value for the label part of the suggestion
   */
  [readLabelValue](item) {
    if (item.label && item.label.constructor && item.label.constructor.name === 'TemplateResult') {
      return item.label;
    }
    return String(item.label || item.value);
  }

  /**
   * @param {Suggestion} item A suggestion to render
   * @return {TemplateResult} Template for a single drop down item
   */
  [itemTemplate](item) {
    const label = this[readLabelValue](item);
    const { description } = item;
    const { compatibility, noink } = this;
    if (description) {
      return html`
      <anypoint-item ?compatibility="${compatibility}">
        <anypoint-item-body ?compatibility="${compatibility}" twoline>
          <div>${label}</div>
          <div secondary>${description}</div>
          ${this[rippleTemplate](compatibility, noink)}
        </anypoint-item-body>
      </anypoint-item>`;
    }
    return html`<anypoint-item ?compatibility="${compatibility}">
      <div>${label}</div>
      ${this[rippleTemplate](compatibility, noink)}
    </anypoint-item>`;
  }

  [rippleTemplate](compatibility, noink) {
    if (compatibility) {
      return '';
    }
    return html`<paper-ripple ?noink="${noink}"></paper-ripple>`;
  }
}
/**
 * Fired when user entered some text into the input.
 * It is a time to query external datastore for suggestions and update "source" property.
 * Source should be updated event if the backend result with empty values and should set
 * the list to empty array.
 *
 * Nore that setting up source in response to this event after the user has closed
 * the dropdown it will have no effect at the moment.
 *
 * @event query
 * @param {String} value An entered phrase in text field.
 */
/**
 * Fired when the item was selected by the user.
 * At the time of receiving this event new value is already set in target input field.
 *
 * @event selected
 * @param {String} value Selected value
 */
