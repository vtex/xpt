# Ouch

## Stuff that are actually wrong

- `store/home` is also defined in `vtex.store`, we should tell people they can extend that, but we maybe should also incentivize them to extend `vtex.dreamstore` whenever possible. What now?
- It's hard to explain that we can extend a block `a` by declaring `a` in another file without the need to call it `a/b`.
- We don't have `vtex.header` and `vtex.footer`, we only have `vtex.dreamstore-header` and `vtex.dreamstore-footer`. Should we declare `header` and footer within `vtex.store`?

## Blocks

- `extensions` -> `blocks`
- `templates` -> `blocks`
- `ExtensionPoint` -> `block`

## Dependencies

- They will forget to depend on what they want to extend, creating useless blocks.

## React

- Should we explain how to use `tsx`?