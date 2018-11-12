# eXtensible JSON Templates

This doc is not meant as a tutorial for the final user of this language. This is a research document. This documents the features provided by it, how they are designed to relate with the Storefront editor and describe scenarios for usability of such concepts. This doc actively tries not to be attached to the current roles held for VTEX's apps, that means, for example, that I'm avoiding the use of real life app examples such as `vtex.dreamstore`, instead, I'll use examples of apps from hipotetical vendors `theme-dev` and `plguin-dev`.

We are developing a [React](https://reactjs.org) single-page application framework with support for extensibility based on [VTEX IO](http://vtex.io/). This extensibility is achieved via a react component called `ExtensionPoint`. When developing code for an application, the developer adds extension points that will be filled with code from other applications. We want to determine a way of declaring those extension points and which extensions fill them.

## Templates

Our language will be based on templates. Each app can declare templates on a `templates.json` file. For an example of such file, suppose `theme-dev` is building an app called `theme-dev.basic-store`. The `templates.json` file for that might look like:

```json
{
    "home": {
        "name": "Home page",
        "description": "A basic store home page.",
        "extensions": ["vtex.header/header", "vtex.banner/banner", "vtex.shelf/shelf", "vtex.footer/footer"],
        "component": "theme-dev.basic-store/HomePage"
    }
}
```

This file declares a template called `home` which represents a Home Page for some store. We've stated that it contains four extension points. Note that the extension points reffer to other apps. The `theme-dev.basic-store` app depends on those apps and the apps have `templates.json` files that declare those templates. That means that the `vtex.header` app declares a template called `header`, the `vtex.banner` app declares a `banner`, so on. The `component` key defines which react component should be loaded by the `home` template, in this case, the `theme-dev.basic-store` app should declare a `HomePage` React component that may reffer to the extension points declared on the `home` template.

```js
const HomePage = () => (
    <React.Fragment>
        <ExtensionPoint id="vtex.header/header" />
        <ExtensionPoint id="vtex.banner/banner" />
        <ExtensionPoint id="vtex.shelf/shelf" />
        <ExtensionPoint id="vtex.footer/footer" />
    </React.Fragment>
)
export default HomePage
}
```

We don't want to keep reffering to the templates and components by their full names, this means we can omit the app name when there's no ambiguity. The available names are defined by which apps our app depends on. This would already make the above files look way nicer.

```json
{
    "home": {
        "name": "Home page",
        "description": "A basic store home page.",
        "extensions": ["header", "banner", "shelf", "footer"],
        "component": "HomePage"
    }
}
```

Moreover, templates declared in the current app never need to be explicitly reffered. If, for example, the `theme-dev.basic-store` app had declared another `banner` template and still had `vtex.banner` as a dependecy, it wouldn't need to use it as `theme-dev.basic-store/banner`, just as `banner`, and would write `vtex.banner/banner` if needed.

The pattern observed in the `HomePage` component where we just want to redeclare every extension point declared on the `templates.json` file is very common, that's why, if no `component` is declared, we will automatically build a React component for you that declares every extension point inside `extensions` with that exact name in order. This results on an even simpler and more semantic `templates.json` file. It also removes the need of declaring a `HomePage` component.

```json
{
    "home": {
        "name": "Home page",
        "description": "A basic store home page.",
        "extensions": ["header", "banner", "shelf", "footer"]
    }
}
```

Since the extension points declared actually reffer to some template declared on a dependency, we are encouraging templates to provide a complete and encapsulated functionality. This has empowered the `theme-dev.basic-store` to create a fully functional `home` depending only on third-party dependencies without needing to have any knowledge of how the templates declared by it actually work.

### Extending templates

Since we are allowing theme developers to create templates that can be used by other developers or by a merchant to configure a store, we want to allow the developer to specify where a template can fit. We a template to be able to substitute other template only if it matchesa certain restrictions imposed by that template. This is why we allow extending templates. If `plugin-dev` wanted to create a new Shelf called `advanced` that can be used wherever `vtex.shelf/shelf` can, they would declare a template derived from `vtex.shelf/shelf` they would depend on `vtex.shelf` and create a template called `shelf/advanced`.

Suppose that `vtex.shelf` has a `templates.json` that looks like this:

```json
{
    "shelf": {
        "name": "Shelf",
        "description": "A carrousel-like shelf that displays store products.",
        "extensions": ["product-summary", "reviews"]
    }
}
```

A `plugin-dev.advanced-shelf` app that depends on `vtex.shelf` could have a `templates.json` such as:

```json
{
    "shelf/advanced": {
        "name": "Advanced shelf",
        "description": "Your everyday shelf, but now with a super cool secret feature.",
        "extensions": ["product-summary", "super-cool-feature", "reviews"]
    }
}
```

This declaration creates a relationship between `shelf`, the "base" template, and `shelf/advanced`, the "derived" template. Extending a template forces the derived template to declare every extension declared by the base template. This means that `shelf/advanced` must declare `product-summary` and `reviews`.

This also allows us to force interesting restrictions on sets of templates. For example, we might want to enforce that every template that exists within a store to declare a `header` and a `footer` extension points. For that, instead of using `home` as the name for our home page template, we could use `store/home` and declare a `store` template like:

```json
{
    "store": {
        "name": "Base store page structure",
        "description": "What every store page should have",
        "extensions": ["header", "footer"]
    }
}
```

After that, we could declare a `store/home` identical to the `home` template declared above and inherit the extensibility of extensions that have relied on the existence of a `header` and a `footer` or any other restrictions and configurations that are consequence of the inheritance from `store`.

## Routes

We already have the power to declare and extend templates. Now we need to be able to use them to create our single-page application. Apps can declare a `routes.json` file. A `vtex.store` app may declare:

```json
{
    "store/home": {
        "path": "/"
    },
    "store/search": {
        "path": "/:term/s"
    },
    "store/product": {
        "path": "/:slug/p"
    }
}
```

Routes should be treated the same way extension points are. They are a special type of extension point. This means that a route called `store/home` works the same way an extension point called `store/home` would, being filled by a `store/home` template declared on this app or on a dependency.

### Classes and extensions

## Theming

### Routes

### IDs

## Plug and Play

## Scenarios

### Theme

### App that provides a new shelf

### App that creates a custom landing page without header/footer