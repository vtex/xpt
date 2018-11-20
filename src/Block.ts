import { ReactProps } from './React'

export interface Block {
  blocks: Block[]
  component: string
  description: string
  id: string
  name: string
  normalizedID: string
  props: ReactProps
}
