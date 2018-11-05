# The eXtensible JSON Template Language

We intend to use this declarative language for the `store` builder, and other product builders that may exist in the future, such as the `blog` builder. This is an early documentation regarding the tought process and initial concepts discussed around this application. Any `.xjt` file will be compiled to a `pages.json` file, allowing the user to be less verbose when configuring a product.

## Features

### Template

A `.xjt` file is composed of some templates. These are the objects declared on the top level of the JSON strucutre. In the file below, `store/home` and `store/products` are tempates. The templates are used to fill extension points, declared on other templates, or routes, declared on a separate `routes.json` file.

```json
{
    "store/home": {
    },
    "store/products": {

    },
}
```

### Components

A template always needs a React component to be rendered wherever this template is used. It is declared on the top level of the template declaration. We can also define props passed to the used element.

```json
{
    "store/home": {
        "component": "render-runtime/LayoutContainer",
        "props": {
            "elements": ["header", "banner", "shelf", "footer"]
        }
    }
}
```

In this case, the `LayoutContainer` is a component that declares extension points with the ids and order defined on the array inside the `elements` prop. Since this is used all the time, we have the following syntax sugar for it:

```json
{
    "store/home": {
        "elements": ["header", "banner", "shelf", "footer"]
    }
}
```

### Extensions

The templates may configure the extension points declared inside it's component by adding a `extensions` object.

```json
{
    "store/home": {
        "elements": ["header", "banner", "shelf", "footer"],
        "extensions": {
            "header": {
                "component": "vtex.dreamstore-header/Header",
            },
            "footer": {
                "component": "vtex.dreamstore-footer/Footer",
            }
        }
    }
}
```

The extension points left unconfigured are not filled at all. This `store/home` template would have an empty `banner` and `shelf`, for example.

### Operators

The language provides two operators. The "extends" (`/`) operator and the "contains" (`.`) operator. These operators are applied on the template name, when it's being declared. Declaring `store/home` is declaring a template that extends a pre-existing `store` template. Declaring `store/home.header` is configuring a `header` extension point contained in `store/home`.

Because `store/home` extends `store`, it inherits every configuration defined for store. This means that the component, it's props and it's extension points configurations are the same as those defined in `store` by default. This also means that `store.header` also configures the `header` extension points inside `store/home`, for example.

If any configuration is defined inside `store/home`, it overrides the ones set by `store`. Naturally, configurations defined inside `store/home.header` override configurations set by `store.header` or by `store` itself, because those are simply extension point configurations for `store/home` and `store`, respectively, and the former overrides the latter.

### Restrictions

We don't want to allow every possible configuration of the declared templates. We might want to disallow any configuration at all or some specific things.