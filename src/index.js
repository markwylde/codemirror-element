import debounce from 'debounce';
import { basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

class CodeMirrorEditor extends HTMLElement {
  static get observedAttributes () { return ['theme', 'value']; }

  constructor () {
    super();
    this.shadow = this.attachShadow({ mode: 'closed' });
    this.appendChild(this.shadow);

    const style = document.createElement('style');
    style.innerHTML = `:host { all: initial }`;
    this.shadow.appendChild(style);

    this.themeCompartment = new Compartment();
    this.baseTheme = EditorView.baseTheme();
  }

  handleChange () {
    const event = new CustomEvent('change');
    this.dispatchEvent(event);
  }

  connectedCallback () {
    const value = this._value;

    const element = document.createElement('div');
    this.shadow.appendChild(element);

    const executeDebounce = debounce(this.handleChange.bind(this), 500);
    element.addEventListener('input', executeDebounce);
    element.addEventListener('change', executeDebounce);
    element.addEventListener('keypress', executeDebounce);
    element.addEventListener('keyup', executeDebounce);
    element.addEventListener('paste', executeDebounce);

    this.editorTheme = new Compartment();

    this.startState = EditorState.create({
      doc: value || '',
      extensions: [this.baseTheme, this.themeCompartment.of(this.baseTheme), basicSetup, javascript()]
    });

    this.view = new EditorView({
      state: this.startState,
      parent: element
    });

    this.theme = this.getAttribute('theme');
  }

  attributeChangedCallback (name, oldValue, newValue) {
    this[name] = newValue;
  }

  get value () {
    return this.view.state.doc.toString();
  }

  set value (newValue) {
    this._value = newValue;

    if (!this.view) {
      return;
    }

    this.startState = EditorState.create({
      doc: newValue,
      extensions: [this.baseTheme, this.themeCompartment.of(this.baseTheme), basicSetup, javascript()]
    });

    this.view.setState(this.startState);

    this.theme = this._theme;
  }

  get theme () {
    return this._theme;
  }

  set theme (newTheme) {
    this._theme = newTheme || 'light';

    if (this._theme === 'light') {
      this.view.dispatch({
        effects: this.themeCompartment.reconfigure(this.baseTheme)
      });
      return;
    }

    if (this._theme === 'dark') {
      this.view.dispatch({
        effects: this.themeCompartment.reconfigure(oneDark)
      });
      return;
    }

    throw new Error('theme must be either light or dark');
  }
}

customElements.define('codemirror-editor', CodeMirrorEditor);
