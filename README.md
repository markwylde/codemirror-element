# codemirror-element

The codemirror editor wrapped in a custom element.

## Example

[Demo app](https://markwylde.com/codemirror-element/1.2.0/)

## Usage

```html
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeMirror Element</title>
  <script src="https://markwylde.com/codemirror-element/1.2.0/CodeMirrorEditor.js"></script>
</head>
<body>
  <codemirror-editor value="function main () {}"></codemirror-editor>
</body>
</html>
```

## API

### theme
You can switch between the `light` and `dark` theme by setting the `theme` attribute on the element.

```html
<codemirror-editor theme="light"></codemirror-editor>
<codemirror-editor theme="dark"></codemirror-editor>
```

```js
document.body.querySelector('codemirror-editor').theme = 'light';
document.body.querySelector('codemirror-editor').theme = 'dark';
```

### value
You can read and update the `value` by setting the `value` attribute on the element.

```html
<codemirror-editor value="const two = 1 + 1;"></codemirror-editor>
```

```js
document.body.querySelector('codemirror-editor').value = 'const two = 1 + 1;';
```

### changes
You can listen for changes by adding a `change` event listener to the element.

```js
const element = document.body.querySelector('codemirror-editor')
element.addEventListener('change', event => {
  console.log('new value is', event.target.value);
});
```

### linting
Eslint is built in, and can be enabled after the element is created:

```js
const element = document.body.querySelector('codemirror-editor')
element.enableLint({
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    es2015: true,
    es2017: true,
    es2020: true
  },
  rules: {
    ...element.defaultLintRules,
    semi: ['error', 'never']
  }
});
```

You can also get the eslint results:

```js
const element = document.body.querySelector('codemirror-editor')
const results = element.verifyLint();

/* results === [
    {
        "ruleId": "no-unused-vars",
        "severity": 2,
        "message": "'main' is defined but never used.",
        "line": 1,
        "column": 10,
        "nodeType": "Identifier",
        "messageId": "unusedVar",
        "endLine": 1,
        "endColumn": 14
    }
]*/
```

## License
This project is licensed under the terms of the MIT license.
