# Developing for VTEX IO stores

> How to build apps that extend and configure VTEX IO stores.

## Table of Contents

- [Blocks](#blocks)
  * [Providing new templates](#providing-new-templates)
  * [Adding React](#adding-react)
    + [Configureable React](#configureable-react)
  * [Providing blocks](#providing-blocks)
  * [Routes](#routes)
  * [Themes](#themes)
  * [Naming conflicts](#naming-conflicts)
- [Configs](#configs)
  * [Configuring a block](#configuring-a-block)
  * [Plug and play](#plug-and-play)

Stores using [VTEX IO](https://vtex.io/) can edit their content through the Storefront editor. This app allows a store admin to edit the layout, content and style of every page in the store.

The default VTEX IO store uses the [Dream Store](https://github.com/vtex-apps/dreamstore) theme. That is defined by the `vtex.dreamstore` app and it already provides a fully featured and highly configurable store that is continuously being improved by VTEX.

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

### Routes

Suppose we want the `partner.theme` app to declare a new route. A new URL that can be accessed, providing some specific template. The `store` builder gives us that power via the `routes.json` file.

```txt
.
├── manifest.json
└── store
    ├── routes.json
    └── blocks.json
```

Suppose our store's url is `store.com` and we want the `store.com/custom` url to hit the `store/custom` template. We need to add a route to our `routes.json`.

```jsonc
{
    "store/custom": {
        "path": "/custom"
    }
}
```

This means that the `store/custom` declared on the `blocks.json` will be rendered when `/custom` is accessed after this app is installed.

### Themes

There's a definition of which app is used as a theme is being used on the store. This is set by the Storefront editor. The default theme for every store is the Dream Store. Every store uses exactly one app as theme.

The theme definition because we will often want to install an app that provides a lot of blocks and wish those blocks to change the whole design of the store, not only provide some blocks to be used here and there. That why this is how we choose which block is used every time we need to choose one:

1. Was this block selected by storefront? If so, use that.
2. Does the theme extend the block defined here by using the same name? If so, use that.
3. Use the defined block.

That is, suppose we are trying using the `store/home` template from the Dream Store and are trying to decide which block will be used as `shelf`. The name `shelf` refers to the `shelf` block declared in `vtex.shelf`,  since `vtex.dreamstore` depends on `vtex.shelf`. If the block was explicitly replaced via the Storefront editor, we use the selected one. If the theme depends on `vtex.shelf` and declares a `shelf` block, we use that. Otherwise, we simply use the `shelf` defined in `vtex.shelf`, since that's what `store/home` referred to.

### Naming conflicts

TODO. Explain the name conflicts resolving rules and how to specify the app using the `:` operator.

1. If block name is declared in the same file, use that.
2. If block name is declared in more than one dependency, fail.
3. If block name is declared in exactly one dependency, use that.
4. If block name is never declared, fail.

## Configs

We wish to empower the apps to create and apply every configuration that the storefront can. That's why the `store` builder accepts a `configs.json` file.

```txt
.
├── manifest.json
└── store
    └── configs.json
```

Suppose we want every `shelf` from `vtex.shelf` to be replaced by an alternative `shelf` provided by the `partner.shelf` app. We could achieve that via either the Storefront editor or the `configs.json` file.

```json
{
    "vtex.shelf:shelf": {
        "block": "partner.shelf:shelf"
    }
}
```

We can also scope those configurations by containment in other blocks. For example, if we want only to replace the shelfs in the `store/home` template but not those in `store/search` or other templates, we could do that by using the containment operator.

```json
{
    "store/home vtex.shelf:shelf": {
        "block": "partner.shelf:shelf"
    }
}
```

The extensions of a block inherit the configurations contained on that block. That means that if I ever use a an alternative `store/home` template that extends it, this configuration will still be valid, that is, the alternative shelf will still be used by it.

Other than changing the blocks, we can also set props for blocks via configs. For instance, suppose that the `Shelf` component used by the `vtex.shelf:shelf` block accepted a boolean prop `highlighted` that, when set to `true`, altered the design for that component. We could want to set that via configs for the `store/home` template instead of changing the block.

```json
{
    "store/home shelf": {
        "props": {
            "highlighted": "true"
        }
    }
}
```

Here, the app defining this config doesn't need to depend on `partner.shelf` anymore, only on `vtex.shelf`, therefore, we don't need to specify which `shelf` it refers to.

### Block names

Since we can select and configure blocks, it becomes useful to identify repeated blocks within the same template, that is, suppose I have a `store/home` extension with two shelves and want to apply different configs between them. I could use the `#` operator to set different names for these blocks without affecting at all their behavior at first.

```json
{
    "store/home": {
        "blocks": ["header/full", "shelf#top", "banner", "shelf#bottom", "footer"]
    }
}
```

Then, I could configure `shelf`, `shelf#top` and `shelf#bottom` all independently. The configurations applied to `shelf` would be set for both `shelf#top` and `shelf#bottom` and merged with the configurations specific to them.

```json
{
    "store/home shelf": {
        "props": {
            "products-displayed": 3
        }
    },
    "store/home shelf#top": {
        "props": {
            "highlighted": true
        }
    }
}
```

The `store/home` would have it's first shelf highlighted and both of them displaying 3 products each.

### Configuring a block

When defining a block, we accept inner block configurations. These work just like a configuration file, but scoped only for that block. We might want to declare an alternative `store/home` that uses the same `shelf` but sets a prop for the `product-summary` within that shelf, we could do that editing only the `blocks.json` file, never touching `configs.json`.

```jsonc
{
    "store/home": {
        "blocks": ["header/full", "banner", "shelf", "footer"],
        "configs": {
            "shelf product-summary": {
                "props": {
                    "buy-button": "hide"
                }
            }
        }
    }
}
```

This would require this app to depend on `vtex.product-summary`, since it refers to it.

### Plug and play

Combining a `configs.json` with a `blocks.json` in an app can provide interesting plug and play functionalities. The `product-summary` block provided by `vtex.product-summary` contains an empty `reviews` block. That `blocks.json` looks something like this.

```jsonc
{
    "product-summary": {
        "component": "ProductSummary",
        "blocks": ["reviews"]
    },
    "reviews": {
    }
}
```

A partner may create a `partner.star-reviews` app that, when installed, will instantly provide star-styled reviews for every `product-summary` in the store. It needs to extend `reviews` via `blocks.json`.

```jsonc
{
    "reviews/stars": {
        "component": "StarReviews"
    }
}
```

And, after defining that block, it may configure the store to use it.

```jsonc
{
    "product-summary reviews": {
        "block": "reviews/stars"
    }
}
```