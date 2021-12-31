enum Action {
  UPVOTE,
  DOWNVOTE,
}

export interface IPost {
  id: number
  username: string
  title: string
  content: string
  date: string
  comments: IComment[]
  reactions: IReactions
  actions: {
    [Action.UPVOTE]: number
    [Action.DOWNVOTE]: number
  }
}

export interface IComment {
  id: number
  username: string
  postId: number
  comment: string
  date: string
}

export interface IUser {
  id: number
  username: string
  password: string
  fullname: string
  actions: IActions[]
}

interface IActions {
  postId: number
  action: Action.UPVOTE | Action.DOWNVOTE | null
  reaction: Reaction.LAUGH | Reaction.LOVE | Reaction.ANGRY | Reaction.SAD | null
}

enum Reaction {
  LAUGH,
  LOVE,
  ANGRY,
  SAD,
}

interface IReactions {
  [Reaction.LOVE]: number
  [Reaction.ANGRY]: number
  [Reaction.SAD]: number
  [Reaction.LAUGH]: number
}
