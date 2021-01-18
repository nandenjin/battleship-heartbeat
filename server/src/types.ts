export enum Role {
  HOST,
  GUEST,
  AUDIENCE,
}

export enum Mode {
  NONE = 0,
  TRAINING,
  MEASURING,
}

export interface ClientListItem {
  id: string
  uid?: string | null
  controller?: string | null
  role: Role
}

export interface Controller {
  id: string
  address: string
  lastOpr?: number
}
