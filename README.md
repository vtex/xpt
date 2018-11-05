# The eXtensible JSON Template Language

We intend to use this declarative language for the `store` builder, and other product builders that may exist in the future, such as the `blog` builder. This is an early documentation regarding the tought process and initial concepts discussed around this application. The bundle of xjt files declared by the apps installed on a store will result in a `pages.json` file.

## Features

### Template

A xjt file is composed of some templates. These are the objects declared on the top level of the JSON strucutre. In the file below, `store/home` and `store/products` are tempates. The templates are used to fill extension points, declared on other templates, or routes, declared on a separate `routes.json` file.

```json
{
    "store/home": {
    },
    "store/products": {
    }
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

### Operators

#### Contained

We want to be able to configure extension points declared by templates. We might want to, for example, define the component used for the `shelf` in `store/home`. For that, we want to declare a template `shelf` contained on the `store/home` template. The contained operator allows us to do that by declaring the template `store/home.shelf` and configuring that extension point from that template.

```json
{
    "store/home.shelf": {
        "component": "partner.shelf/Shelf"
    }
}
```

#### Extends

We want to be able to create templates that inherit the definitions from other templates. For example, one app might declare a `store/home`, a `store/home.shelf` and a `store/home.banner`. Another app may want to use the same definitions but change the order, putting the banner before the shelf. It would create an extended version of `store/home`, named, for example, `inverted`, by declaring the template `store/home/inverted` with a different `elements`.

```json
{
    "store/home/inverted": {
        "elements": ["header", "shelf", "banner", "footer"]
    }
}
```

Note that we might also want to override the extension points only for the `inverted` template by declaring, for example, `store/home/inverted.shelf`.

## Plug and Play

One of the main advantages provided by this language is plug and play. We can create new apps and, depending on the template names, some definitions will be automatically overriden by the installation, making apps work and be applied out of the box.

For that, we define a precedency order for the templates based on which app defines them. The `vtex.store` defines the defaults. Those are overriden by definitions created by installed apps and thos, in turn, are overriden by installed apps where the vendor name matches the account name.

## Concept test scenarios

Assume that the account name is `mystore`. We will use the account name `partner` to simulate an extension developer who is not creating a store right now.

### `partner` dev providing alternative homes

This new home reorder shows the shelf above the banner. Create an app called `partner.theme`, for example, with a `store/store.json`:

```json
{
    "store/home/inverted": {
        "elements": ["header", "shelf", "banner", "footer"]
    }
}
```

This provides an alternative home for the merchant to select from the `storefront`. To create an alternative plug and play home that provides this alteration upon installing the app, the `store/store.json` should be:

```json
{
    "store/home": {
        "elements": ["header", "shelf", "banner", "footer"]
    }
}
```

### `partner` dev providing alternative shelf

Inside the `partner.shelf` app there's a `Shelf` component. The partner could create a plug an play shelf:

```json
{
    "store.shelf": {
        "component": "Shelf"
    }
}
```

Alternatively, a shelf that only overrides the standart shelf inside the `store/home` template could be provided, leaving every other template unchanged:

```json
{
    "store/home.shelf": {
        "component": "Shelf"
    }
}
```

Another possibility would be to provide an extension of the standart shelf which would not be used anywhere when simply installed:

```json
{
    "store.shelf/alt": {
        "component": "Shelf"
    }
}
```

Leaving to the `mystore` dev the task of using this component somewhere, maybe by defining a new `store/home` in `mystore.store`:

```json
{
    "store/home": {
        "elements": ["header", "banner", "shelf/alt", "footer"]
    }
}
```

Or, another scenario would be for the `partner.shelf` developer not to declare a `store/store.json` at all and leave the configuration completely to the `mystore.store` dev:

```json
{
    "store/home.shelf": {
        "component": "partner.shelf/Shelf"
    }
}
```

### Add stars to the shelf

Assuming that the standart `shelf` contains an extension point called `product-summary` with another extension point called `review` that is empty by default. There's where the plug and play is really cool:

```json
{
    "store.product-summary.reviews": {
        "component": "Stars"
    }
}
```

The merchant only needs to install the app.

### Define a layout prop inside a specific component

Assuming that the `details` extension point inside a `store/product` template is filled with a component that has an `isInverted` prop which performs a layout change. The `mystore.store` dev could apply this change by setting:

```json
{
    "store/product.details": {
        "props": {
            "isInverted": true
        }
    }
}
```

This could also be applied by any other installed app, for example the `partner.theme`.

### Create an app that provides two different product templates

The `partner.theme` app would provide these two definitions

```json
{
    "store/product/default": {
        "elements": ["header", "details", "footer"]
    },
    "store/product/bannerbelow": {
        "elements": ["header", "details", "banner", "footer"]
    },
}
```

### Create a search template that may be used on the route `store/search/brand` but also on the route `store/search`.

The `partner.theme` app would provide a

```json
{
    "store/search/custom": {
        "component": "CustomSearch"
    }
}
```