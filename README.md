# Developing for VTEX IO stores

> How to build apps that extend and configure VTEX IO stores.

Stores using [VTEX IO](https://vtex.io/) can edit their content through the Storefront editor. This app allows a store admin to edit the layout, content and style of every page in the store.

The default store installed on an VTEX IO store uses the [Dream Store](https://github.com/vtex-apps/dreamstore) theme. That is defined by the `vtex.dreamstore` app and it already provides a fully featured and highly configurable store that is continuously being improved by VTEX.

## Blocks

The store builder allows you to extend existing blocks, like the ones provided by the Dream Store, allowing them to replace the blocks they extend via the Storefront editor. They also allow you to build completely new blocks that provide functionality specific to your business needs and, then, create templates to insert those new blocks in your client's store while still benefiting from the continuous progress made by the Dream Store and it's extensions on the other parts of your store.

### Providing new templates

Let's build an app that provides a new home page template. Our template will be available on the Storefront editor for the admin to select among the various templates available. The Dream Store provides a home page template and the various blocks used in it, among several other templates and blocks, let's use the available blocks to build a home page different from the Dream Store's home page.

First, we will need to [build a new IO app](http://help.vtex.com/en/tracks/vtex-io-getting-started). Let's call our app `partner.theme`. The starting point to creating a new template is the `store` builder. First, let's use that by declaring it on our app's `manifest.json`.

```jsonc
{
    "vendor": "partner",
    "name": "theme",
    // other configuration
    "builders": {
        // other builders
        "store": "0.x"
    }
}
```

Configuring the store builder requires a `store` folder on the root of our app. If we want to create templates, we will need a `blocks.json` file inside that `store` folder. This means that, for now, our app's folder structure contains at least:

```txt
.
├── manifest.json
└── store
    └── blocks.json
```

The Dream Store has already defined a home page template, which is the one used by default. Let's take a look at what that portion of the `blocks.json` from the `vtex.dreamstore` app looks like.

```jsonc
{
    "store/home": {
        "name": "Dream Store home page",
        "blocks": ["header/full", "banner", "shelf", "footer"],
    },
    // some other blocks
}
```

This file is declaring a `store/home` block which has a descriptive `name` which will be displayed in the Storefront editor. It also declares which blocks are contained within it. This means that the same `blocks.json` may declare those blocks or that the app depends on apps that declare those blocks inside their `blocks.json` files. In this specific case, the `vtex.dreamstore` app depends on apps that declare each of those, `vtex.header` declaring `header`, `vtex.banner` declaring `banner`, `vtex.shelf` declaring `shelf` and `vtex.footer` declaring `footer`.

Why did Dream Store use `store/home` instead of just calling the block `home`? This means that `store/home` is a block that **extends** a `store` block. The `vtex.dreamstore` app depends on `vtex.store` which declares the `store` block, let's take a look at that declaration.

```jsonc
{
    "store": {
        "name": "Base store block",
        "block": ["header", "footer"]
    },
    // other blocks
}
```

It actually has some other definitions, but this part means that every extension of a `store` block contains a `header` and a `footer`. If `store/home` didn't contain either a `header` or a `footer` it would fail to build.

Note that `store/home` could use `header/full` instead of `header`, even though `store` forced it to have a `header` block. That is because the main advantage of extensibility is that **every block can be replaced by an extension of it**. Meaning that, since `header/full` extends `header`, we could use it to fill a gap destined for `header`.

To create a block that can replace the `store/home` via the Storefront editor, we need only to create an extension of `store/home`. Let's do that using our `blocks.json` file within the `partner.theme` app.

```jsonc
{
    "store/home/alternative": {
        "name": "Alternative home page",
        "description": "A home page with a shelf and two banners",
        "blocks": ["header/full", "banner", "shelf", "banner", "footer"]
    }
}
```

Great! But what does `store/home` mean? What about `banner`? Well, we need to depend on the apps that declare them otherwise none of this makes any sense. Let's do that on our `manifest.json`.

```jsonc
{
    "vendor": "partner",
    "name": "theme",
    // other configuration
    "builders": {
        // other builders
        "store": "0.x"
    },
    "dependencies": {
        "vtex.dreamstore": "1.x",
        "vtex.header": "0.x",
        "vtex.banner": "0.x",
        "vtex.shelf": "0.x",
        "vtex.footer": "1.x"
    }
}
```

That's it! Now we can link `partner.theme` by running `vtex link` on it's root folder and check our brand new home template available through the Storefront editor. When we publish this app and a store installs it by running `vtex install partner.theme`, it will also be available.

### Adding React

We've only declared simple blocks so far, ones that just load a block after another, this didn't require any react from our side. These are very useful because they allow the store admin to reorder the components via the Storefront editor through a drag and drop interface, therefore, we encourage using them as much as possible.

Despite that, of course, many times we do need more complex blocks, that's why we allow the full power of [React](http://reactjs.org). Let's take a look at what the `shelf` block inside `vtex.shelf` looks like.

```jsonc
{
    "shelf": {
        "component": "Shelf",
        "name": "A store shelf",
        "description": "Displays product summaries based on a query.",
        "blocks": ["product-summary"]
    }
}
```

The `Shelf` component should use the blocks declared in the `shelf` block. To do that, it can use a `Block` component. It can use this block as many times as it wishes. Let's suppose the `Shelf` component just renders a certain amount of `product-summary` blocks based on a utils function.

```jsx
import React, { Fragment } from 'react'
import { Block } from 'render'
import { repeat } from 'ramda'
import amountOfProducts from './utils/amountOfProducts'

const Shelf = () => (
    <Fragment>
        {repeat(<Block id="product-summary", amountOfProducts())}
    </Fragment>
)

export default Shelf
```

To be able to use this React component, `vtex.shelf` needed the `react` builder, which is declared on the `manifest.json`.

```jsonc
{
    "vendor": "vtex",
    "name": "shelf",
    // other definitions
    "builders": {
        "store": "0.x",
        "react": "2.x",
        // other builders
    },
    "dependencies": {
        "vtex.product-summary": "1.x",
        // other dependencies
    }
}
```

The React component is, then, stored inside a `react` folder. It also has some dependencies, declared on a `package.json` file, also inside that `react` folder and imports a file inside a `utils` folder.

```jsonc
{
    "name": "vtex.shelf",
    "description": "React code for a product shelf",
    // some other definitions
    "dependencies": {
        "ramda": "0.x",
    },
    "devDependencies": {
        "react": "16.x",
    }
}
```

The folder structure for this app is looking something like:

```txt
.
├── manifest.json
├── react
|   ├── package.json
|   ├── utils
|   |   └── amountOfProducts.js
|   └── Shelf.jsx
└── store
    └── blocks.json
```

Note that we didn't need to declare `render` as a dependency in `package.json`. That dependency is already injected by the `react` builder.

#### Configureable React

TODO.

- Explain component schemas

### Providing blocks

Let's create another app `partner.shelf` that provides an alternative shelf with a different React component. instead of providing a full template. The process is very similar to creating a template. We'll have both the `react` and the `store` builders. The folder structure might look something like:

```txt
.
├── manifest.json
├── react
|   ├── package.json
|   ├── Description.json
|   └── Shelf.jsx
└── store
    └── blocks.json
```

The `manifest.json` declares both builders and the dependency on `vtex.shelf` and `vtex.product-summary`, since the app want to extend the Dream Store `shelf` block.

```jsonc
{
    "vendor": "partner",
    "name": "shelf",
    "description": "A different shelf, made by partner.",
    "builders": {
        "store": "0.x",
        "react": "2.x"
    },
    "dependencies": {
        "vtex.product-summary": "1.x",
        "vtex.shelf": "0.x"
    }
}
```

The `blocks.json` creates a `shelf` block that extends the `shelf` block on `vtex.shelf`. We could extend it more explicitly by calling it, for example, `shelf/alternative`, but, since we depend on someone who declares a `shelf`, it is clear that, by declaring another `shelf`, we are extending the one on `vtex.shelf`. We also add a new block inside the shelf, a `shelf-description` block, which loads a `Description` react component.

```json
{
    "shelf": {
        "name": "Shelf with description",
        "component": "Shelf",
        "blocks": ["shelf-description", "product-summary"]
    },
    "shelf-description": {
        "component": "Description"
    }
}
```

This structure is enough to provide this alternative shelf to be used on the Storefront editor. When installed, this app will provide the alternative shelf.

Note that we've also created a brand new block, that doesn't extend any previous declared block. The `shelf-description`. We can create brand new blocks all we want. We may, for example, create a `creative-block` that provides a brand new feature and add it to the home page by providing a new `store/home` that uses it.

```json
{
    "store/home": {
        "name": "Home page with a creative block",
        "blocks": ["header/full", "banner", "shelf", "creative-block", "footer"]
    ,
    "creative-block": {
        "component": "CreativeBlock"
    }
}
```

### Themes

TODO.

- Explain how an app can be set as a theme. Removing the need from the Storefront user to select every template provided.

## Routes

TODO.

- How to add store routes?
- How to add custom routes?

## Configs

TODO. This is the advanced user part.

### Configuring a block

TODO.

- How to provide a block with some default config definitions.

### Plug and play

TODO.

- How to provide a plug and play block.