import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import UserTasksHeader from '../modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'
import filterTeam from '../utils/relay/filterTeam'
import useAtmosphere from '../hooks/useAtmosphere'
import useDocumentTitle from 'hooks/useDocumentTitle'

interface Props {
  viewer: MyDashboardTasks_viewer
}

const MyDashboardTasks = (props: Props) => {
  const {viewer} = props
  const atmosphere = useAtmosphere()
  useDocumentTitle('My Tasks | Parabol', 'My Tasks')
  useEffect(() => {
    return () => filterTeam(atmosphere, null)
  }, [])
  return (
    <>
      <UserTasksHeader viewer={viewer} />
      <UserColumnsContainer viewer={viewer} />
    </>
  )
}

export default createFragmentContainer(MyDashboardTasks, {
  viewer: graphql`
    fragment MyDashboardTasks_viewer on User {
      ...UserColumnsContainer_viewer
      ...UserTasksHeader_viewer
    }
  `
})
