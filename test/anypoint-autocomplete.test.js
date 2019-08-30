import { fixture, assert, aTimeout, nextFrame, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../anypoint-autocomplete.js';


describe('<anypoint-autocomplete>', function() {
  const suggestions = ['Apple', 'Apricot', 'Avocado', 'Banana'];
  const objectSuggestions = [
    {
      value: 'Apple',
      id: 1,
    },
    {
      value: 'Apricot',
      id: 2,
    },
    {
      value: 'Avocado',
      id: 3,
    },
    {
      value: 'Banana',
      id: 4,
    },
    {
      value: 'Olive',
      id: 5,
    },
  ];

  function notifyInput(target) {
    const e = document.createEvent('Event');
    e.initEvent('input', true, false);
    target.dispatchEvent(e);
  }

  async function basicFixture() {
    return await fixture(html`<anypoint-autocomplete></anypoint-autocomplete>`);
  }

  async function suggestionsFixture() {
    return await fixture(html`
      <div>
        <input id="f1" />
        <anypoint-autocomplete noanimations target="f1" .source="${suggestions}"></anypoint-autocomplete>
      </div>
    `);
  }

  async function loaderFixture() {
    return await fixture(html`
      <div>
        <input id="f2" />
        <anypoint-autocomplete loader target="f2"></anypoint-autocomplete>
      </div>
    `);
  }

  async function stringTargetFixture() {
    return await fixture(html`<div><input id="f2">
    <anypoint-autocomplete target="f2"></anypoint-autocomplete></div>`);
  }

  async function compatibilityFixture() {
    return await fixture(html`<div><input id="f2">
    <anypoint-autocomplete compatibility target="f2"></anypoint-autocomplete></div>`);
  }

  describe('Initialization', () => {
    let element;
    before(async () => {
      element = await basicFixture();
    });

    it('has empty _suggestions', () => {
      assert.deepEqual(element._suggestions, []);
    });

    it('has default loader', () => {
      assert.isFalse(element.loader);
    });

    it('has default _loading', () => {
      assert.isFalse(element._loading);
    });

    it('has default _opened', () => {
      assert.isFalse(element._opened);
    });

    it('has default openOnFocus', () => {
      assert.isFalse(element.openOnFocus);
    });

    it('has default horizontalAlign', () => {
      assert.equal(element.horizontalAlign, 'center');
    });

    it('has default verticalAlign', () => {
      assert.equal(element.verticalAlign, 'top');
    });

    it('has default scrollAction', () => {
      assert.equal(element.scrollAction, 'refit');
    });

    it('has default horizontalOffset', () => {
      assert.equal(element.horizontalOffset, 0);
    });

    it('has default verticalOffset', () => {
      assert.equal(element.verticalOffset, 2);
    });

    it('generates an id', () => {
      assert.notEmpty(element.id);
    });

    it('sets position style programatically', () => {
      assert.equal(element.style.position.trim(), 'absolute');
    });
  });

  describe('User input', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('anypoint-autocomplete');
      input = region.querySelector('input');
    });

    it('sets _previousQuery', function() {
      input.value = 'test';
      notifyInput(input);
      assert.equal(input.value, element._previousQuery);
    });

    it('dispatches query event', function() {
      const spy = sinon.spy();
      element.addEventListener('query', spy);
      input.value = 'test';
      notifyInput(input);
      assert.equal(spy.args[0][0].detail.value, 'test');
    });

    it('filters suggestions', function() {
      const word = 'TEST';
      element.addEventListener('query', function f(e) {
        e.target.removeEventListener('query', f);
        e.target.source = [word, word + '2', 'etra73hxis'];
      });
      input.value = 'test';
      notifyInput(input);
      assert.lengthOf(element.suggestions, 2);
    });
  });

  describe('_targetChanged()', () => {
    it('Recognizes target by id', async () => {
      const fix = await stringTargetFixture();
      const element = fix.querySelector('anypoint-autocomplete');
      const input = fix.querySelector('input');
      assert.isTrue(element._oldTarget === input);
      assert.isTrue(element.target === input);
    });

    it('calls notifyResize()', async () => {
      const element = await basicFixture();
      const input = document.createElement('input');
      const spy = sinon.spy(element, 'notifyResize');
      element.target = input;
      assert.isTrue(spy.called);
    });

    it('sets target only once', async () => {
      const element = await basicFixture();
      const input = document.createElement('input');
      element.target = input;
      const spy = sinon.spy(element, 'notifyResize');
      element.target = input;
      assert.isFalse(spy.called);
    });

    it('ignores string attribute when no parent', async () => {
      const region = await fixture(html`<div>
        <input id="r1">
        <anypoint-autocomplete></anypoint-autocomplete>
      </div>`);
      const element = region.querySelector('anypoint-autocomplete');
      const parent = element.parentElement;
      parent.removeChild(element);
      element.target = 'r1';
      assert.equal(element.target, 'r1');
    });

    it('reinitializes parent when re-attached to the dom', async () => {
      const region = await fixture(html`<div>
        <input id="r1">
        <anypoint-autocomplete></anypoint-autocomplete>
      </div>`);
      const element = region.querySelector('anypoint-autocomplete');
      const parent = element.parentElement;
      parent.removeChild(element);
      element.target = 'r1';
      parent.appendChild(element);
      const input = region.querySelector('input');
      assert.isTrue(element.target === input);
    });

    it('removes listeners from old target', async () => {
      const region = await fixture(`<div>
        <input id="i1">
        <input id="i2">
        <anypoint-autocomplete target="r1"></anypoint-autocomplete>
      </div>`);
      const element = region.querySelector('anypoint-autocomplete');
      const i1 = region.querySelector('#i1');
      element.target = 'i2';
      const spy = sinon.spy();
      element.addEventListener('query', spy);
      i1.value = 'test';
      notifyInput(i1);
      assert.isFalse(spy.called);
    });

    it('adds listeners to new target', async () => {
      const region = await fixture(`<div>
        <input id="i1">
        <input id="i2">
        <anypoint-autocomplete target="r1"></anypoint-autocomplete>
      </div>`);
      const element = region.querySelector('anypoint-autocomplete');
      const i2 = region.querySelector('#i2');
      element.target = 'i2';
      const spy = sinon.spy();
      element.addEventListener('query', spy);
      i2.value = 'test';
      notifyInput(i2);
      assert.isTrue(spy.called);
    });
  });

  describe('Suggestions processing', function() {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('anypoint-autocomplete');
      input = region.querySelector('input');
    });

    it('computes suggestions list', () => {
      input.value = 'App';
      notifyInput(input);
      assert.equal(element.suggestions.length, 1);
    });

    it('uses previously filtered query', async () => {
      input.value = 'a';
      notifyInput(input);
      assert.equal(element.suggestions.length, 4);
      await aTimeout();
      /* eslint-disable require-atomic-updates */
      input.value = 'ap';
      notifyInput(input);
      assert.equal(element.suggestions.length, 2);
    });

    it('resets previous suggestions when query changes', async () => {
      input.value = 'a';
      notifyInput(input);
      assert.equal(element.suggestions.length, 4);
      await aTimeout();
      input.value = 'pa';
      notifyInput(input);
      assert.equal(element.suggestions.length, 0);
    });

    it('dispatches "selected" event', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      const spy = sinon.spy();
      element.addEventListener('selected', spy);
      element._listbox.selectNext();
      assert.equal(spy.args[0][0].detail.value, 'Apple');
    });

    it('sets value on target when "selected" event not cancelled', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element._listbox.selectNext();
      await aTimeout(1);
      assert.equal(input.value, 'Apple');
    });

    it('closes the suggestions', async () => {
      input.value = 'a';
      notifyInput(input);
      await aTimeout();
      element._listbox.selectNext();
      await aTimeout(1);
      assert.isFalse(element.opened);
    });

    it('sets selected suggestion object on selected event', async () => {
      element.source = objectSuggestions;
      input.value = 'apr';
      notifyInput(input);
      await aTimeout();
      const spy = sinon.spy();
      element.addEventListener('selected', spy);
      element._listbox.selectNext();
      assert.deepEqual(spy.args[0][0].detail.value, objectSuggestions[1]);
    });
  });

  describe('Suggestions with progress', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await loaderFixture();
      element = region.querySelector('anypoint-autocomplete');
      input = region.querySelector('input');
    });

    it('renders progress bar', async () => {
      input.value = 'a';
      notifyInput(input);
      await nextFrame();
      const node = element.querySelector('paper-progress');
      assert.ok(node);
    });

    it('sets loading property', async () => {
      input.value = 'a';
      notifyInput(input);
      assert.isTrue(element.loading);
    });

    it('removes progress bar when suggestions are set', async () => {
      input.value = 'a';
      notifyInput(input);
      await nextFrame();
      element.source = ['apple'];
      await nextFrame();
      const node = element.querySelector('paper-progress');
      assert.notOk(node);
    });

    it('removes progress bar when empty suggestions are set', async () => {
      input.value = 'a';
      notifyInput(input);
      await nextFrame();
      element.source = [];
      await nextFrame();
      const node = element.querySelector('paper-progress');
      assert.notOk(node);
    });
  });

  describe('renderSuggestions()', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('anypoint-autocomplete');
      input = region.querySelector('input');
    });

    it('sets _previousQuery', () => {
      input.value = 'a';
      element.renderSuggestions();
      assert.equal(element._previousQuery, 'a');
    });

    it('accespts numeric input', () => {
      input.type = 'number';
      element._oldTarget.parentElement.removeChild(element._oldTarget);
      element._oldTarget = {
        value: 2,
      };
      element.renderSuggestions();
      element._oldTarget = undefined;
      assert.equal(element._previousQuery, '2');
    });

    it('calls _disaptchQuery()', () => {
      input.value = 'a';
      const spy = sinon.spy(element, '_disaptchQuery');
      element.renderSuggestions();
      assert.equal(spy.args[0][0], input.value);
    });

    it('calls _filterSuggestions()', () => {
      input.value = 'a';
      const spy = sinon.spy(element, '_filterSuggestions');
      element.renderSuggestions();
      assert.isTrue(spy.called);
    });

    it('calls _filterSuggestions() when has _previousQuery that matches', () => {
      input.value = 'a';
      element.renderSuggestions();
      input.value = 'ap';
      const spy = sinon.spy(element, '_filterSuggestions');
      element.renderSuggestions();
      assert.isTrue(spy.called);
    });

    it('ignores change when not attached to the dom', () => {
      element.parentElement.removeChild(element);
      input.value = 'a';
      element.renderSuggestions();
      assert.equal(element._previousQuery, undefined);
    });

    it('clears suggestions when query changes', () => {
      input.value = 'a';
      element.renderSuggestions();
      input.value = 'test';
      element.renderSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('opens element when loader', () => {
      element.loader = true;
      input.value = 'a';
      element.renderSuggestions();
      assert.isTrue(element.opened);
    });

    it('is called on input change', async () => {
      input.value = 'a';
      notifyInput(input);
      assert.equal(element._previousQuery, 'a');
    });
  });

  describe('_filterSuggestions()', () => {
    it('Does nothing when event target not set', async () => {
      const element = await basicFixture();
      element._filterSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('Does nothing when no previous query set', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = undefined;
      element._previousQuery = 'test';
      element._filterSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('Does nothing when source', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element._filterSuggestions();
      assert.deepEqual(element._suggestions, []);
    });

    it('Filters out string values', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = ['a', 'aa', 'b', 'ab'];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, ['a', 'aa', 'ab']);
    });

    it('Filters out string values - cap query', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = ['a', 'aa', 'b', 'ab'];
      element._previousQuery = 'A';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, ['a', 'aa', 'ab']);
    });

    it('Filters out string values - cap items', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = ['A', 'Aa', 'b', 'Ab'];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, ['A', 'Aa', 'Ab']);
    });

    it('Filters out object values', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [
        {
          value: 'a',
        },
        {
          value: 'aa',
        },
        {
          value: 'b',
        },
        {
          value: 'ab',
        },
      ];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, [{ value: 'a' }, { value: 'aa' }, { value: 'ab' }]);
    });

    it('Filters out object values - cap query', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }, { value: 'b' }, { value: 'ab' }];
      element._previousQuery = 'A';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, [{ value: 'a' }, { value: 'aa' }, { value: 'ab' }]);
    });

    it('Filters out object values - cap items', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'A' }, { value: 'Aa' }, { value: 'b' }, { value: 'Ab' }];
      element._previousQuery = 'a';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, [{ value: 'A' }, { value: 'Aa' }, { value: 'Ab' }]);
    });

    it('Returns all when no query', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }, { value: 'b' }, { value: 'ab' }];
      element._previousQuery = '';
      element._filterSuggestions();
      assert.typeOf(element.suggestions, 'array');
      assert.deepEqual(element.suggestions, element.source);
    });

    it('Closes element when no items after filtered', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }];
      element._previousQuery = 'b';
      element._opened = true;
      element._filterSuggestions();
      assert.isFalse(element.opened);
    });

    it('Sorts the results #1', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'zoab' }, { value: 'saab' }, { value: 'ab' }, { value: 'Ab' }];
      element._previousQuery = 'ab';
      element._filterSuggestions();
      assert.deepEqual(element.suggestions, [
        { value: 'ab' },
        { value: 'Ab' },
        { value: 'saab' },
        { value: 'zoab' },
      ]);
    });

    it('Sorts the results #2', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'xab' }, { value: 'xxab' }, { value: 'abxx' }];
      element._previousQuery = 'ab';
      element._filterSuggestions();
      assert.deepEqual(element.suggestions, [
        { value: 'abxx' },
        { value: 'xab' },
        { value: 'xxab' },
      ]);
    });

    it('Sorts the results #3', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'xxxab' }, { value: 'ab' }];
      element._previousQuery = 'ab';
      element._filterSuggestions();
      assert.deepEqual(element.suggestions, [{ value: 'ab' }, { value: 'xxxab' }]);
    });

    it('Opens the overlay', async () => {
      const element = (await suggestionsFixture()).querySelector('anypoint-autocomplete');
      element.source = [{ value: 'a' }, { value: 'aa' }];
      element._previousQuery = 'a';
      element._filterSuggestions();
      await aTimeout();
      assert.isTrue(element.opened);
    });
  });

  describe('_targetFocusHandler()', () => {
    let element;
    const source = ['Apple', 'Appli', 'Applo'];

    beforeEach(async () => {
      element = (await stringTargetFixture()).querySelector('anypoint-autocomplete');
      element.source = source;
      element.openOnFocus = true;
      element._suggestions = source;
      await nextFrame();
    });

    it('Does nothing when openOnFocus is not set', () => {
      element.openOnFocus = false;
      element._targetFocusHandler();
      assert.isUndefined(element.__autocompleteFocus);
    });

    it('Does nothing when opened', () => {
      element._opened = true;
      element._targetFocusHandler();
      assert.isUndefined(element.__autocompleteFocus);
    });

    it('Does nothing when __autocompleteFocus is already set', () => {
      element.__autocompleteFocus = 1;
      element._targetFocusHandler();
      assert.equal(element.__autocompleteFocus, 1);
    });

    it('Does nothing when __ignoreNextFocus is set', () => {
      element.__ignoreNextFocus = 1;
      element._targetFocusHandler();
      assert.equal(element.__ignoreNextFocus, 1);
    });

    it('Sets __autocompleteFocus', () => {
      element._valueChanged = () => {};
      element._targetFocusHandler();
      assert.isTrue(element.__autocompleteFocus);
    });

    it('Re-sets __autocompleteFocus', async () => {
      element._valueChanged = () => {};
      element._targetFocusHandler();
      await aTimeout(1);
      assert.isFalse(element.__autocompleteFocus);
    });

    it('Calls renderSuggestions()', async () => {
      element._targetFocusHandler();
      const spy = sinon.spy(element, 'renderSuggestions');
      await aTimeout(1);
      assert.isTrue(spy.called);
    });
  });

  describe('onquery', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onquery);
      const f = () => {};
      element.onquery = f;
      assert.isTrue(element.onquery === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onquery = f;
      element._disaptchQuery('test');
      element.onquery = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onquery = f1;
      element.onquery = f2;
      element._disaptchQuery('test');
      element.onquery = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onselected', () => {
    let element;
    beforeEach(async () => {
      const region = await stringTargetFixture();
      element = region.querySelector('anypoint-autocomplete');
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onselected);
      const f = () => {};
      element.onselected = f;
      assert.isTrue(element.onselected === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onselected = f;
      element._inform('test');
      element.onselected = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onselected = f1;
      element.onselected = f2;
      element._inform('test');
      element.onselected = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('compatibility property', () => {
    let element;
    const source = ['Apple', 'Appli', 'Applo'];

    beforeEach(async () => {
      const region = await compatibilityFixture();
      element = region.querySelector('anypoint-autocomplete');
      element.source = source;
      element.openOnFocus = true;
      element._suggestions = source;
      await nextFrame();
    });

    it('sets compatibility property on anypoin-item', () => {
      const item = element.querySelector('anypoint-item');
      assert.isTrue(item.compatibility);
    });

    it('does not render ripple effect', () => {
      const item = element.querySelector('paper-ripple');
      assert.notOk(item);
    });
  });

  describe('_targetKeydown', () => {
    let element;
    let input;
    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('anypoint-autocomplete');
      input = region.querySelector('input');
      element._previousQuery = input.value = 'a';
      element._filterSuggestions();
      await aTimeout();
      element._opened = false;
    });

    it('calls _onDownKey() when ArrowDown', () => {
      const spy = sinon.spy(element, '_onDownKey');
      MockInteractions.keyDownOn(input, 40, [], 'ArrowDown');
      assert.isTrue(spy.called);
    });

    it('calls _onEnterKey() when Enter', () => {
      const spy = sinon.spy(element, '_onEnterKey');
      MockInteractions.keyDownOn(input, 13, [], 'Enter');
      assert.isTrue(spy.called);
    });

    it('calls _onTabDown() when Enter', () => {
      const spy = sinon.spy(element, '_onTabDown');
      MockInteractions.keyDownOn(input, 9, [], 'Tab');
      assert.isTrue(spy.called);
    });

    it('calls _onEscKey() when Escape', () => {
      const spy = sinon.spy(element, '_onEscKey');
      MockInteractions.keyDownOn(input, 27, [], 'Escape');
      assert.isTrue(spy.called);
    });

    it('calls _onUpKey() when ArrowUp', async () => {
      element._listbox._focusedItem = element._listbox.items[3];
      const spy = sinon.spy(element, '_onUpKey');
      MockInteractions.keyDownOn(input, 38, [], 'ArrowUp');
      assert.isTrue(spy.called);
    });
  });

  describe('_onDownKey()', () => {
    let element;
    let input;

    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('anypoint-autocomplete');
      input = region.querySelector('input');
      element._previousQuery = input.value = 'a';
      element._filterSuggestions();
      await nextFrame();
      element._opened = false;
    });

    it('calls renderSuggestions() when closed', () => {
      const spy = sinon.spy(element, 'renderSuggestions');
      element._onDownKey();
      assert.isTrue(spy.called);
    });

    it('eventually focuses on the list when closed', async () => {
      element._opened = true;
      const spy = sinon.spy(element._listbox, 'focus');
      element._onDownKey();
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('focuses on the list when opened', () => {
      element._opened = true;
      const spy = sinon.spy(element._listbox, 'focus');
      element._onDownKey();
      assert.isTrue(spy.called);
    });
  });

  describe('_onUpKey()', () => {
    let element;
    let input;

    beforeEach(async () => {
      const region = await suggestionsFixture();
      element = region.querySelector('anypoint-autocomplete');
      input = region.querySelector('input');
      element._previousQuery = input.value = 'a';
      element._filterSuggestions();
      await nextFrame();
      element._listbox._focusedItem = element._listbox.items[3];
      element._opened = false;
    });

    it('calls renderSuggestions() when closed', async () => {
      const spy = sinon.spy(element, 'renderSuggestions');
      element._onUpKey();
      assert.isTrue(spy.called);
      await aTimeout();
    });

    it('eventually focuses on the list when closed', async () => {
      element._opened = true;
      const spy = sinon.spy(element._listbox, '_focusPrevious');
      element._onUpKey();
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('focuses on the list when opened', () => {
      element._opened = true;
      const spy = sinon.spy(element._listbox, '_focusPrevious');
      element._onUpKey();
      assert.isTrue(spy.called);
    });
  });

  describe('compatibility mode', () => {
    it('sets compatibility on item when setting legacy', async () => {
      const element = await basicFixture();
      element.legacy = true;
      assert.isTrue(element.legacy, 'legacy is set');
      assert.isTrue(element.compatibility, 'compatibility is set');
    });

    it('returns compatibility value from item when getting legacy', async () => {
      const element = await basicFixture();
      element.compatibility = true;
      assert.isTrue(element.legacy, 'legacy is set');
    });
  });
});
