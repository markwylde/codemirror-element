import { basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { javascript, esLint } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { linter, lintKeymap, lintGutter } from '@codemirror/lint';
import { Linter } from 'eslint-linter-browserify';

const defaultRules = Array.from(new Linter().getRules()).reduce((defaultRules, entry) => {
  const [key, value] = entry;
  if (value.meta.docs.recommended) {
    defaultRules[key] = 2;
  }

  return defaultRules;
}, { });

class CodeMirrorEditor extends HTMLElement {
  static get observedAttributes () { return ['theme', 'value']; }

  constructor () {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.appendChild(this.shadow);

    const style = document.createElement('style');
    style.innerHTML = ':host { all: initial }';
    this.shadow.appendChild(style);

    this.themeCompartment = new Compartment();
    this.baseTheme = EditorView.baseTheme();
  }

  get defaultLintRules () {
    return defaultRules;
  }

  handleChange () {
    const event = new CustomEvent('change');
    this.dispatchEvent(event);
  }

  createState () {
    return EditorState.create({
      doc: this._value || '',
      extensions: [
        ...[
          this.baseTheme,
          this.themeCompartment.of(this.baseTheme),
          basicSetup,
          javascript()
        ],

        ...(this.lint
          ? [
              keymap.of([...lintKeymap]),
              lintGutter(),
              linter(esLint(this.linter, this.lint))
            ]
          : [])
      ]
    });
  }

  connectedCallback () {
    this.element = document.createElement('div');
    this.shadow.appendChild(this.element);

    const handleChange = () => {
      if (this._value === this.value) {
        return;
      }

      this._value = this.value;
      this.handleChange();
    };

    this.element.addEventListener('input', handleChange);
    this.element.addEventListener('change', handleChange);
    this.element.addEventListener('keypress', handleChange);
    this.element.addEventListener('keyup', handleChange);
    this.element.addEventListener('paste', handleChange);

    this.editorTheme = new Compartment();
    this.theme = this.getAttribute('theme');
    this.linter = new Linter({ cwd: '/' });

    this.syncState();
  }

  syncState () {
    if (!this.element) {
      return;
    }

    const state = this.createState();

    if (!this.view) {
      this.view = new EditorView({
        state,
        parent: this.element
      });
      return;
    }

    this.view.setState(state);
  }

  attributeChangedCallback (name, oldValue, newValue) {
    this[name] = newValue;
    this.syncState();
  }

  enableLint (config) {
    this.lint = config;
    this.syncState();
  }

  verifyLint () {
    if (!this.lint) {
      throw new Error('linting must be enabled to run verifyLint');
    }

    return this.linter.verify(this.value, this.lint);
  }

  get value () {
    return this.view.state.doc.toString();
  }

  set value (newValue) {
    this._value = newValue;

    if (!this.view) {
      return;
    }

    this.syncState();

    this.theme = this._theme;

    this.handleChange();
  }

  get theme () {
    return this._theme;
  }

  set theme (newTheme) {
    if (!this.view) {
      return;
    }

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
