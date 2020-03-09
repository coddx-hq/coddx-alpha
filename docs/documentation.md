# Documentation

### How does it work?

Coddx uses Mozilla's Templating Engine called <a href="https://github.com/mozilla/nunjucks">nunjucks</a>. Nunjucks is a powerful library, supports more advanced use cases like parameters, custom filters, etc.

### Templating Syntax

Built-in Template Variables:
- {{fileName}} - will be replace with the value of "File Name" field.
- {{YYYY}}, {{MM}}, {{DD}}, {{HH}}, {{mm}} - year, month, day, hours (24), minutes.

<a href="https://mozilla.github.io/nunjucks/templating.html">Nunjucks Templating Syntax</a>

### Parameters

You can declare custom parameters (Parameters field) in JSON format, for example:
- { "myVar": "value" } - declare `myVar`, then use it in your template like `{{myVar}}`

### Custom filters

(Coming soon)
