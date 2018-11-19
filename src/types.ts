export interface Block {
  blocks: Block[]
  component: string
  description: string
  id: string
  name: string
  normalizedID: string
  props: ReactProps
}

export interface Route {
  path: string
  block: Block
}

export interface ReactProps { [key: string]: any }

export interface PagesJSON {
  routes: PagesRoutes
  templates: PagesTemplates
  pages: PagesPages
}

export interface PagesRoutes { [templateID: string]: PagesRoute }
export interface PagesRoute {
  path: string
}

export interface PagesTemplates { [templateID: string]: PagesTemplate}
export interface PagesTemplate {
  component: string
  props?: ReactProps
  extensions: PagesExtensions
}

export interface PagesExtensions { [treepath: string]: PagesExtension }
export interface PagesExtension {
  component: string
  props?: ReactProps
}

export interface PagesPages { [templateID: string]: PagesPage[] }
export interface PagesPage {
  name: string
  template: string
}
