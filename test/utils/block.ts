import { append, compose, map, range }  from 'ramda'
import { Block } from '../../src/types'
import { invertedNth, notNull } from './helpers'

function generateLeafBlock (index: number): Block {
  return {
    blocks: [],
    component: `Component${index}`,
    description: `Loads a Component${index}`,
    id: `${index}`,
    name: `Block ${index}`,
    normalizedID: `partner.app:${index}`,
    props: { index, isTrue: true },
  }
}

export function generateLeafBlocks (amount: number): Block[] {
  return map(generateLeafBlock, range(0,amount))
}

function generateBlock (index: number, children: Block[]) {
  return {
    ...generateLeafBlock(index),
    blocks: children,
  }
}

export function appendBlock (childrenIndexes: number[], current: Block[]): Block[] {
  const index = current.length
  const children = map(invertedNth(current), childrenIndexes)
  return append(generateBlock(index, children), current)
}
