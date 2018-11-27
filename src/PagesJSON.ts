import { Block } from  './Block'
import { ReactProps } from './React'
import { Route } from './Route'

import { concat, dissoc, flatten, map, range, reduce, toString, zipObj } from 'ramda'

export default class PagesJSON {
  public pages: PagesPages
  public routes: PagesRoutes
  public templates: PagesTemplates

  constructor (routes: ReadonlyArray<Route>) {
    const pagesTemplateNames = map(toString, range(0,routes.length))

    this.pages = zipObj(pagesTemplateNames, map(pageFromTemplateName, pagesTemplateNames))
    this.routes = zipObj(pagesTemplateNames, map(transpileRoute, routes))
    this.templates = zipObj(pagesTemplateNames, map(templateFromRoute, routes))
  }
}

function pageFromTemplateName (template: string): PagesPage[] {
  return [{
    name: '',
    template,
  }]
}

function transpileRoute (route: Readonly<Route>): PagesRoute {
  return {
    path: route.path,
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
    const currentTreePath = treePath === '' ? block.rawID : concat(concat(treePath, '/'), block.rawID)
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

interface PagesRoutes { [templateID: string]: PagesRoute }
interface PagesRoute {
  path: string
}

interface PagesTemplates { [templateID: string]: PagesTemplate}
interface PagesTemplate {
  component: string
  props?: ReactProps
  extensions: PagesExtensions
}

interface PagesExtensions { [treepath: string]: PagesExtension }
interface PagesExtension {
  component: string
  props?: ReactProps
}

interface PagesPages { [templateID: string]: PagesPage[] }
interface PagesPage {
  name: string
  template: string
}

interface ExtensionDescription extends PagesExtension {
  treePath: string
}

type DeepExtensionDescriptions = ExtensionDescription | DeepExtensionDescriptionArray

interface DeepExtensionDescriptionArray extends Array<DeepExtensionDescriptions> {}
