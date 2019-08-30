import { html } from 'lit-html';

export default html`
  <section class="documentation-section">
    <h2>Usage</h2>
    <p>Anypoint button comes with 2 predefied styles:</p>
    <ul>
      <li><b>Regular</b> - The list is styled for Material Design</li>
      <li>
        <b>Compatibility</b> - To provide compatibility with Anypoint design
      </li>
    </ul>

    <h3>Installation</h3>
    <code>npm install --save @anypoint-web-components/anypoint-autocomplete</code>
    <details>
      <summary>In a HTML document</summary>
      <code>
        <pre>
  ${`<html>
    <head>
      <script type="module">
        import '@anypoint-web-components/anypoint-autocomplete/anypoint-autocomplete.js';
        import '@anypoint-web-components/anypoint-input/anypoint-input.js';
      </script>
    </head>
    <body>
      <div class="parent">
        <anypoint-input id="targetInput"></anypoint-input>
        <anypoint-autocomplete target="targetInput"></anypoint-autocomplete>
      </div>
    </body>
  </html>`}
        </pre>
      </code>
    </details>

    <h3>Connecting the input</h3>
    <p>
      To connect autocomplete to a text input use <code>target</code> property.
      It accepts a reference to a HTMLElement or a string which is the ID
      of the input element.<br/>
      When using ID attribute the target input has to have the same parent
      as the autocomplete element. It does not query the document for the ID.
    </p>

    <details>
      <summary>Code example</summary>
      <code>
        <pre>
  ${`<div class="parent">
    <anypoint-input id="targetInput"></anypoint-input>
    <anypoint-autocomplete target="targetInput"></anypoint-autocomplete>
  </div>`}
        </pre>
      </code>
    </details>

    <h3>Passing suggestions</h3>

    <h4>Static suggestions</h4>
    <p>
      To pass suggestions to the element use <code>source</code> property.
      Static suggestions are rendered immidietly.
    </p>

    <details>
      <summary>Code example</summary>
      <code>
        <pre>
  ${`<div class="parent">
    <anypoint-input id="targetInput"></anypoint-input>
    <anypoint-autocomplete target="targetInput"></anypoint-autocomplete>
    <script>
    {
      document.querySelector('anypoint-autocomplete').source = [
        'a',
        'b',
        'c',
        'd'
      ];
    }
    </script>
  </div>`}
        </pre>
      </code>
    </details>

    <p>
      The list of suggestions can contain either a list of string which are rendered
      in the drop down list, or a list of objects. When rendering objects it expects
      a <code>value</code> property to be set to render this value in the list.
    </p>

    <p>
      When the user select a suggestion it's value is inserted into the text field
      and <code>selected</code> event is dispatched containing the original value of
      the suggestion.
    </p>

    <h4>Asynchronous suggestions</h4>
    <p>
      When the input value changes the autocomplete dispatches <code>query</code>
      event. Your application should handle this event, generate suggestions for the user,
      and set the <code>source</code> property.
    </p>

    <p>
      To indicate to the user that the suggestions are async you may set <code>loader</code>
      property. It renders a progress bar until source property change.
    </p>

    <details>
      <summary>Code example</summary>
      <code>
        <pre>
  ${`<div class="parent">
    <anypoint-input id="targetInput"></anypoint-input>
    <anypoint-autocomplete target="targetInput"></anypoint-autocomplete>
    <script>
    {
      document.querySelector('anypoint-autocomplete').onquery = (e) => {
        const { value } = e.detail;
        const suggestions = await getAsyncSuggestions(value);
        e.target.source = suggestions;
      };
    }
    </script>
  </div>`}
        </pre>
      </code>
    </details>
  </section>
`;
