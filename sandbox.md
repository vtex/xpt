# Sandbox

## `vtex`

### `vtex.store`

Depends on:

- `vtex.header` declaring `header`
- `vtex.footer` declaring `footer`
- `vtex.shelf` declaring `shelf`
- `vtex.search` declaring `results`

#### `context.json`

Only `vtex.store` writes this file. We could hard-code it instead of creating a file for it.

```json
{
    "store": "StoreContextProvider",
    "home": "HomeContextProvider",
    "search": "SearchContextProvider"
}
```

#### `templates.json`

Reffers to contexts declared on `context.json`.

```json
{
    "store": {
        "extensions": ["header", "footer"],
        "context": ["store"]
    },
    "store/home": {
        "extensions": ["header", "shelf", "footer"],
        "context": ["store", "home"]
    },
    "store/search": {
        "extensions": ["header", "results", "footer"],
        "context": ["store", "search"]
    }
}
```

#### `routes.json`

Reffers to templates declared on `templates.json`. Each entry is a template name and provides a path for it. This means that filling that path requires extending that template.

```json
{
    "store/home": {
        "path": "/"
    },
    "store/search": {
        "path": "/:term/s"
    }
}
```

### `vtex.dreamstore`

#### `templates.json`

```json
{
    "store/home": {
        "extensions": ["header", "banner", "shelf", "footer"]
    },
    "store/search": {
        "extensions": ["header", "banner", "results", "footer"]
    }
}
```

#### `routes.json`

```json
{
    "store/search#brand": {
        "path": "/:brand/b"
    }
}
```

## `partner`

### `partner.delivery-store`

This is a theme. Depends on:

- `partner.franchises` declaring `header` (extending `vtex.header/header`) and `results/with-franchise-selector`
- `partner.banners` declaring `banner/low-height`
- `vtex.store` described above
- `vtex.header` declaring `header`
- `vtex.banner` declaring `banner`
- `vtex.shelf` declaring `shelf`
- `vtex.footer` declaring `footer`
- `vtex.search` declaring `results` and `search-bar`

#### `templates.json`

```json
{
    "store/home": {
        "name": "Delivery store home",
        "description": "A home for a delivery store",
        "extensions": [
            "partner.franchise-selector/header",
            "banner#upper",
            "shelf",
            "banner",
            "footer"
        ]
    },
    "store/search/franchise": {
        "name": "Search by franchise",
        "description": "A search page with a franchise selector.",
        "extensions": ["header", "franchise-info", "results/with-franchise-selector", "footer"]
    },
    "store/franchises": {
        "name": "Franchises page",
        "description": "A place that displays all available franchises.",
        "extensions": ["header", "franchises-list", "footer"]
    }
```

#### `configs.json`

```json
{
    "store/home banner#upper": {
        "template": "banner/low-height",
        "props": {
            "arrows": "simple"
        }
    }
}
```

#### `routes.json`
```json
{
    "store/franchises": {
        "path": "/franchises/"
    }
}
```