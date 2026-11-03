export type RsvpSubmission = {
  id: string
  name: string
  attending: boolean
  message: string
  createdAt: string
}

export type RsvpStoreData = {
  submissions: RsvpSubmission[]
}
