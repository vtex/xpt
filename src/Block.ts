import { ReactProps } from './React'

export class Block {
  public blocks: Block[]
  public component: string
  public description: string
  public rawID: string
  public name: string
  public props: ReactProps

  /* Where 
  public get parentID () {

  }
}

type LocalBlockID = string /* ${LocalBlockID}/${string} */
type BlockID = string /* ${appID}:${LocalBlockID} */
