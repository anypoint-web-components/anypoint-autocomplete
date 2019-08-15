import { html } from 'lit-html';

export default html`
  <section class="documentation-section">
    <h2>Accessibility</h2>
    <p>
      The autocomplete element follows W3C guidelines for
      <a href="https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html">
        ARIA 1.1 Combobox with Listbox Popup
      </a>. The element is enabled to support screen readers.
    </p>

    <p>
      Because of how screen readers parses page content and associate roles, the
      element places suggestions as child elements of the autosuggestion element. This means that
      you may accidentally style list items from your master CSS file.
    </p>

    <p>
      Because autocomplete element and text input requires a parent element with specific role,
      put both elements inside single parent. The element takes care of setting roles and aria
      attributes on all elements.
    </p>

    <details>
      <summary>Code example - Your code</summary>
      <code>
        <pre>
  ${`<div class="parent">
    <anypoint-input id="targetInput"></anypoint-input>
    <anypoint-autocomplete target="targetInput"></anypoint-autocomplete>
  </div>`}
        </pre>
      </code>
    </details>

    <details>
      <summary>Code example - Final structure</summary>
      <code>
        <pre>
  ${`<div
    class="parent"
    role="combobox"
    aria-label="Text input with list suggestions"
    aria-expanded="true"
    aria-owns="paperAutocompleteInput7302"
    aria-haspopup="listbox">
    <anypoint-input
      id="targetInput"
      aria-autocomplete="list"
      autocomplete="off"
      aria-haspopup="true"
      aria-controls="paperAutocompleteInput63418"></anypoint-input>
    <anypoint-autocomplete
      target="targetInput"
      id="paperAutocompleteInput7302"
      aria-controls="paperAutocompleteInput63418"
      >
      <anypoint-dropdown>
        <anypoint-listbox
          aria-label="Use arrows and enter to select list item. Escape to close the list."
          role="listbox"
          aria-activedescendant=""
          id="paperAutocompleteInput63418"></anypoint-listbox>
      </anypoint-dropdown>
    </anypoint-autocomplete>
  </div>`}
        </pre>
      </code>
    </details>
    <p>
      You can set <code>aria-label</code> on the parent to override default message.
      However other attributes are always changed to comply with accessibility requirements.
    </p>
  </section>
`;
