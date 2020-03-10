import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {IComment, ThreadSourceEnum} from 'types/graphql'
import convertToTaskContent from 'utils/draftjs/convertToTaskContent'
import safeRemoveNodeFromConn from 'utils/relay/safeRemoveNodeFromConn'
import {DeleteCommentMutation_meeting} from '__generated__/DeleteCommentMutation_meeting.graphql'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {DeleteCommentMutation as TDeleteCommentMutation} from '../__generated__/DeleteCommentMutation.graphql'
import getReflectionGroupThreadConn from './connections/getReflectionGroupThreadConn'

graphql`
  fragment DeleteCommentMutation_meeting on DeleteCommentSuccess {
    comment {
      id
      isActive
      content
      threadParentId
      threadId
      threadSource
    }
  }
`

const mutation = graphql`
  mutation DeleteCommentMutation($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...DeleteCommentMutation_meeting @relay(mask: false)
    }
  }
`

const handleDeleteComment = (comment, store) => {
  const commentId = comment.getValue('id')
  const replies = comment.getLinkedRecords('replies')
  const threadParentId = comment.getValue('threadParentId')
  const isRoot = !threadParentId
  const hasReplies = replies && replies.length > 0
  const doTombstone = isRoot && hasReplies
  if (doTombstone) {
    const TOMBSTONE = convertToTaskContent('[deleted]')
    comment.setValue(TOMBSTONE, 'content')
    comment.setValue(false, 'isActive')
  } else {
    const threadId = comment.getValue('threadId')!
    const threadSource = comment.getValue('threadSource')!
    const reflectionGroupId = threadSource === ThreadSourceEnum.REFLECTION_GROUP ? threadId : ''
    const reflectionGroup = store.get(reflectionGroupId)
    const reflectionGroupConn = getReflectionGroupThreadConn(reflectionGroup)
    safeRemoveNodeFromConn(commentId, reflectionGroupConn)
  }
}

export const DeleteCommentMeetingUpdater: SharedUpdater<DeleteCommentMutation_meeting> = (
  payload,
  {store}
) => {
  const comment = payload.getLinkedRecord('comment')
  if (!comment) return
  handleDeleteComment(comment, store)
}

const DeleteCommentMutation: SimpleMutation<TDeleteCommentMutation> = (atmosphere, variables) => {
  return commitMutation<TDeleteCommentMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('deleteComment')
      DeleteCommentMeetingUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {commentId} = variables
      const comment = store.get<IComment>(commentId)
      if (!comment) return
    }
  })
}

export default DeleteCommentMutation