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
import { LitElement, TemplateResult } from 'lit-element';
import { AnypointListbox } from '@anypoint-web-components/anypoint-listbox';

export declare interface Suggestion {
  /**
   * A value to be used to insert into the text field
   */
  value: string;
  /**
   * When set this will be used as the drop down list label
   */
  label?: string | TemplateResult;
  /**
   * When set it renders a second line for the suggestion with help message.
   * Keep it short!
   */
  description?: string | TemplateResult;
  /**
   * WHen set this value is used to filter the suggestions instead of `value`
   */
  filter?: string;
}

declare interface InternalSuggestion extends Suggestion {
  /**
   * The index of the suggestion on the source list.
   */
  index: number;
}

export declare const suggestionsValue: unique symbol;
export declare const processSource: unique symbol;
export declare const normalizeSource: unique symbol;
export declare const itemTemplate: unique symbol;
export declare const readLabelValue: unique symbol;
export declare const rippleTemplate: unique symbol;
export declare const openedValue: unique symbol;
export declare const openedValuePrivate: unique symbol;
export declare const autocompleteFocus: unique symbol;

/**
 * Autocomplete for a text input with Material Design and Anypoint themes.
 */
export class AnypointAutocomplete extends LitElement {
  createRenderRoot(): AnypointAutocomplete;

  /**
   * A target input field to observe.
   * It accepts an element which is the input with `value` property or
   * an id of an element that is a child of the parent element of this node.
   */
  target: HTMLElement;
  _oldTarget: HTMLElement;
  /**
   * List of suggestions to display.
   * If the array items are strings they will be used for display a suggestions and
   * to insert a value.
   * If the list is an object the each object must contain `value` and `display`
   * properties.
   * The `display` property will be used in the suggestions list and the
   * `value` property will be used to insert the value to the referenced text field.
   */
  source: string[]|Suggestion[];
  /**
   * List of suggestion that are rendered.
   */
  readonly suggestions: string[]|InternalSuggestion[];
  /**
   * List of suggestion that are rendered.
   */
  _suggestions: string[]|Suggestion[];
  /**
   * True when user query changed and waiting for `source` property update
   */
  _loading: boolean;
  /**
   * Set this to true if you use async operation in response for query event.
   * This will display a loader when querying for more suggestions.
   * Do not use it it you do not handle suggestions asynchronously.
   */
  loader: boolean;
  /**
   * If true it will opend suggestions on input field focus.
   */
  openOnFocus: boolean;

  readonly opened: boolean;
  /**
   * The orientation against which to align the element vertically
   * relative to the text input.
   * Possible values are "top", "bottom", "middle", "auto".
   */
  verticalAlign: string;
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
  verticalOffset: number;
  /**
   * The orientation against which to align the element horizontally
   * relative to the text input. Possible values are "left", "right",
   * "center", "auto".
   */
  horizontalAlign: string;
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
  horizontalOffset: number;
  /**
   * Determines which action to perform when scroll outside an opened overlay
   * happens. Possible values: lock - blocks scrolling from happening, refit -
   * computes the new position on the overlay cancel - causes the overlay to
   * close
   */
  scrollAction: string;
  /**
   * Removes animation from the dropdown.
   */
  noAnimations: boolean;
  /**
   * Removes ripple effect from list items.
   * This effect is always disabled when `compatibility` is set.
   */
  noink: boolean;
  /**
   * Enables compatibility with Anypoint components.
   */
  compatibility: boolean;
  /**
   * @deprecated Use `compatibility` instead.
   */
  legacy: boolean;

  /**
   * When set it won't setup `aria-controls` on target element.
   */
  noTargetControls: boolean;
  /**
   * When set the element won't update the `value` property on the
   * target when a selection is made.
   */
  noTargetValueUpdate: boolean;

  isAttached: boolean;

  _previousQuery: string;

  readonly _listbox: AnypointListbox;

  /**
   * A handler for `query` event
   */
  onquery: EventListener|null;

  /**
   * A handler for `selected` event
   */
  onselected: EventListener|null;

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  firstUpdated(): void;

  /**
   * Handler for target property change.
   */
  _targetChanged(): void;

  /**
   * Sets target input width on the listbox before rendering.
   */
  _setComboboxWidth(): void;

  /**
   * Setups relavent aria attributes in the target input.
   * @param target An element to set attribute on to
   */
  _setupTargetAria(target: HTMLElement): void;

  /**
   * Sets `aria-expanded` on input's parent element.
   */
  _openedChanged(opened: boolean): void;

  /**
   * Renders suggestions on target's `input` event
   */
  _targetInputHandler(e: CustomEvent): void;

  /**
   * Renders suggestions on target input focus if `openOnFocus` is set.
   */
  _targetFocusHandler(): void;

  /**
   * Renders suggestions for current input and opens the overlay if
   * there are suggestions to show.
   */
  renderSuggestions(): void;

  /**
   * Disaptches query event and returns it.
   * @param value Current input value.
   */
  _disaptchQuery(value: string): CustomEvent;

  /**
   * Filter `source` array for current value.
   */
  _filterSuggestions(): void;

  _listSuggestions(source: string[]|InternalSuggestion[], query: string): string[]|InternalSuggestion[];

  _closeHandler(): void;

  notifyResize(): void;

  _selectionHandler(e: CustomEvent): void;

  /**
   * Inserts selected suggestion into the text box and closes the suggestions.
   * @param selected Index of suggestion to use.
   */
  _selectSuggestion(selected: number): void;

  _refocusTarget(): void;

  /**
   * Handler for the keydown event.
   */
  _targetKeydown(e: KeyboardEvent): void;

  /**
   * If the dropdown is opened then it focuses on the first element on the list.
   * If closed it opens the suggestions and focuses on the first element on
   * the list.
   */
  _onDownKey(): void;

  /**
   * If the dropdown is opened then it focuses on the last element on the list.
   * If closed it opens the suggestions and focuses on the last element on
   * the list.
   */
  _onUpKey(): void;

  /**
   * Closes the dropdown.
   */
  _onEscKey(): void;

  /**
   * Accetps first suggestion from the dropdown when opened.
   */
  _onEnterKey(): void;

  /**
   * The element refocuses on the input when suggestions closes.
   * Also, the lisbox element is focusable so with tab it can be next target.
   * Finally, the dropdown has close animation that takes some time to finish
   * so it will try to refocus after the animation finish.
   * This function sets flags in debouncer to prohibit this.
   */
  _onTabDown(): void;

  /**
   * Dispatches `selected` event with new value.
   *
   * @param value Selected value.
   */
  _inform(value: string[]|Suggestion[]): void;

  render(): TemplateResult;

  /**
   * @returns Returns a template for the listbox
   */
  _listboxTemplate(): TemplateResult;

  /**
   * @return Returns a template for the progress bar
   */
  _loaderTemplate(): TemplateResult;

  /**
   * @return {Array<Object>} Returns a template for the list item
   */
  _listTemplate(): TemplateResult[];

  /**
   * @param item A suggestion to render
   * @returns Value for the label part of the suggestion
   */
  [readLabelValue](item: Suggestion): TemplateResult|string;
}
