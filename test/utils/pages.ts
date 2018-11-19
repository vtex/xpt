import { map, zipObj } from 'ramda'
import { PagesPage, PagesPages } from '../../src/types'

function buildPagesPage (template: string): PagesPage[] {
  return [
    {
      name: '',
      template,
    }
  ]
}

export function buildPagesPages (templates: string[]): PagesPages {
  return zipObj(templates, map(buildPagesPage, templates))
}
