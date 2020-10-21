## Form sets

You can also use a form set instead of a form. In that case `initFormSet` (instead of `initUploadFields`)
in your javascript code.

```
initFormSet(form_element, options)
```

```js
initFormSet(
  document.getElementById("example-form"),
  { prefix: "form" }
);
```

* Note that the default form set prefix is `form`.
* Also see the `testproject` directory in the repository for an example.
