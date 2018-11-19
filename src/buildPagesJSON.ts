import { concat, dissoc, flatten, map, range, reduce, toString, zipObj } from 'ramda'

import { Block, PagesExtension, PagesExtensions, PagesJSON, PagesPage, PagesRoute, PagesTemplate, Route } from './types'

export default function buildPagesJSON (routes: ReadonlyArray<Route>): PagesJSON {
  const pagesTemplateNames = map(toString, range(0,routes.length))

  return {
    pages: zipObj(pagesTemplateNames, map(pageFromTemplateName, pagesTemplateNames)),
    routes: zipObj(pagesTemplateNames, map(transpileRoute, routes)),
    templates: zipObj(pagesTemplateNames, map(templateFromRoute, routes)),
  }
}

function pageFromTemplateName (templateName: string): PagesPage[] {
  return [{
    name: '',
    template: templateName
  }]
}

function transpileRoute (route: Readonly<Route>): PagesRoute {
  return {
    path: route.path
  }
}

function buildExtensionFromBlock (block: Readonly<Block>, treePath: string): ExtensionDescription {
  return {
    component: block.component,
    props: block.props,
    treePath,
  }
}

function getDeepExtensionDescriptions (treePath: string) {
  return (block: Readonly<Block>): DeepExtensionDescriptionArray => {
    const currentTreePath = treePath === '' ? block.id : concat(concat(treePath, '/'), block.id)
    return [
      buildExtensionFromBlock(block, currentTreePath),
      map(getDeepExtensionDescriptions(currentTreePath), block.blocks)
    ]
  }
}

function addToPagesExtensions (current: PagesExtensions, description: ExtensionDescription): PagesExtensions {
  current[description.treePath] = dissoc('treePath', description)
  return current
}

function templateFromRoute (route: Readonly<Route>): PagesTemplate {
  const deepExtensionDescriptions = map(getDeepExtensionDescriptions(''), route.block.blocks)
  const extensionDescriptions = flatten(deepExtensionDescriptions) as ExtensionDescription[]
  return {
    component: route.block.component,
    extensions: reduce(addToPagesExtensions, {}, extensionDescriptions),
    props: route.block.props,
  }
}

interface ExtensionDescription extends PagesExtension {
  treePath: string
}

type DeepExtensionDescriptions = ExtensionDescription | DeepExtensionDescriptionArray

interface DeepExtensionDescriptionArray extends Array<DeepExtensionDescriptions> {}
