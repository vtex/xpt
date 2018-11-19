import buildPagesJSON from '../src/buildPagesJSON'

import { compose, curry } from 'ramda'
import { appendBlock, generateLeafBlocks } from './utils/block'
import { buildPagesPages } from './utils/pages'

import { Block, Route } from '../src/types'

describe('buildPagesJSON', () => {
  it('converts between Routes and the Pages.json format',  () => {
    const block = {
      blocks: [],
      component: 'Component',
      description: 'Some block that loads a component',
      id: 'block',
      name: 'Some block',
      normalizedID: 'partner.app/block',
      props: {},
    }

    const route = {
      block,
      path: '/',
    }

    expect(buildPagesJSON([route])).toEqual({
      pages: buildPagesPages(['0']),
      routes: {
        '0': {
          path: '/',
        },
      },
      templates: {
        '0': {
          component: 'Component',
          extensions: {},
          props: {},
        }
      },
    })
  })

  it('accepts two routes with the same block', () => {
    const block = {
      blocks: [],
      component: 'Component',
      description: 'Some block that loads a component',
      id: 'block',
      name: 'Some block',
      normalizedID: 'partner.app/block',
      props: { test: 'prop' },
    }

    const routes = [
      {
        block,
        path: '/a-path',
      },
      {
        block,
        path: '/another-path'
      }
    ]

    expect(buildPagesJSON(routes)).toEqual({
      pages: buildPagesPages(['0','1']),
      routes: {
        '0': {
          path: '/a-path',
        },
        '1': {
          path: '/another-path',
        },
      },
      templates: {
        '0': {
          component: 'Component',
          extensions: {},
          props: { test: 'prop' },
        },
        '1': {
          component: 'Component',
          extensions: {},
          props: { test: 'prop' },
        }
      },
    })
  })

  it('maps extensions within blocks', () => {
    const blocks = appendBlock([0,3], generateLeafBlocks(4))

    const routes = [
      {
        block: blocks[4],
        path: '/path',
      },
    ]

    expect(buildPagesJSON(routes)).toEqual({
      pages: buildPagesPages(['0']),
      routes: {
        '0': {
          path: '/path',
        },
      },
      templates: {
        '0': {
          component: 'Component4',
          extensions: {
            '0': {
              component: 'Component0',
              props: { index: 0, isTrue: true },
            },
            '3': {
              component: 'Component3',
              props: { index: 3, isTrue: true },
            }
          },
          props: { index: 4, isTrue: true },
        }
      }
    })
  })

  it('maps extensions recursively with proper treepath', () => {
    const curriedAppendBlock = curry(appendBlock)
    const blocks = compose(
      curriedAppendBlock([4]),
      curriedAppendBlock([0,2]),
      curriedAppendBlock([1,2]),
      curriedAppendBlock([0]),
    )(generateLeafBlocks(2))

    const routes = [
      {
        block: blocks[5],
        path: '/path'
      }
    ]

    expect(buildPagesJSON(routes)).toEqual({
      pages: buildPagesPages(['0']),
      routes: {
        '0': {
          path: '/path',
        },
      },
      templates: {
        '0': {
          component: 'Component5',
          extensions: {
            '4': {
              component: 'Component4',
              props: { index: 4, isTrue: true },
            },
            '4/0': {
              component: 'Component0',
              props: { index: 0, isTrue: true },
            },
            '4/2': {
              component: 'Component2',
              props: { index: 2, isTrue: true },
            },
            '4/2/0': {
              component: 'Component0',
              props: { index: 0, isTrue: true },
            },
          },
          props: { index: 5, isTrue: true }
        }
      }
    })
  })
})
