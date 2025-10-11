/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-vars */
import { useEffect } from "react"
import MessagesMember from "./MessagesMember"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setFollowingUsers, setMessages, setSuggestedUser } from "@/features/userDetail/userDetailsSlice"
import ChatBox from "./ChatBox"
import { SearchDialogWithCheckboxesComponent } from "./search-dialog-with-checkboxes"
import { IoIosArrowDown } from "react-icons/io"
import Sidebar from "../Home/Sidebar"
import api from "@/api/api"
import axios from "axios"
import PropTypes from "prop-types"

export function ChatComponent({ socketRef }) {
  const messages = useSelector((state) => state.counter.messages)
  const userDetails = useSelector((state) => state.counter.userDetails)
  const suggestedUser = useSelector((state) => state.counter.suggestedUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const followingusers = useSelector((state) => state.counter.followingUsers)
  const convo = Object.values(followingusers)

  const getFollowingUsers = async (username) => {
    try {
      const userId = userDetails.id
      const response = await axios.get(`/api/conversations/conversation/${userId}`)
      const followingUsers = [...response?.data]
      dispatch(setFollowingUsers(followingUsers))
      return response.data
    } catch (error) {
      console.error("Error fetching following users:", error)
      if (
        error?.response?.statusText === "Unauthorized" ||
        error?.response?.status === 403
      ) {
        navigate("/login")
      }
    }
  }

  const getRealTimeMessages = () => {
    if (!socketRef?.current) return

    socketRef.current.on("newMessage", (newMessage) => {
      const senderId = newMessage.senderId._id
      const filtered = convo.filter((user) => user._id !== senderId)

      const objToMove = { ...newMessage.senderId, lastMessage: newMessage.lastMessage }
      const followingUsers = [objToMove, ...filtered]

      dispatch(setFollowingUsers(followingUsers))

      if (suggestedUser?._id === newMessage.senderId._id) {
        if (Array.isArray(messages)) {
          dispatch(setMessages([...messages, newMessage]))
        }
      }
    })

    socketRef.current.on("senderMessage", (newMessage) => {
      const reciverId = newMessage.reciverId._id
      const filtered = convo.filter((user) => user._id !== reciverId)

      const objToMove = { ...newMessage.reciverId, lastMessage: newMessage.lastMessage }
      const followingUsers = [objToMove, ...filtered]

      dispatch(setFollowingUsers(followingUsers))

      if (Array.isArray(messages)) {
        dispatch(setMessages([...messages, newMessage]))
      }
    })

    socketRef.current.on("sendGroupMessage", (newMessage) => {
      // console.log(newMessage)
      const groupId = newMessage.groupId
      const filtered = convo.filter((user) => user._id !== groupId)

      const objToMove = {
        lastMessage: { text: newMessage.message, createdAt: newMessage.timestamp },
        groupImage: "uploads/groupProfile.jpeg",
        groupName: newMessage.groupName,
        _id: groupId,
      }

      const followingUsers = [objToMove, ...filtered]

      dispatch(setFollowingUsers(followingUsers))

      if (Array.isArray(messages)) {
        dispatch(setMessages([...messages, newMessage]))
      }
    })
  }

  useEffect(() => {
    getRealTimeMessages()

    return () => {
      if (socketRef?.current) {
        socketRef.current.off("newMessage")
        socketRef.current.off("senderMessage")
        socketRef.current.off("sendGroupMessage")
      }
    }
  }, [messages]) // reruns when messages change

  useEffect(() => {
    if (userDetails?.username) {
      dispatch(setSuggestedUser(null))
      getFollowingUsers(userDetails.username)
    }
    return () => {
      dispatch(setSuggestedUser(null))
    }
  }, [userDetails, setMessages])

  useEffect(() => {
    if (userDetails?.id) {
      gettAllMessages()
    }
  }, [userDetails, suggestedUser])

  const gettAllMessages = async () => {
    try {
      const senderId = userDetails?.id
      if (!senderId) return

      if (suggestedUser && Object.keys(suggestedUser).length > 0) {
        const response = await api.get(
          "groupName" in suggestedUser
            ? `/conversations/group/messages/${suggestedUser?._id}`
            : `/conversations/all/messages/${suggestedUser?._id}?senderId=${senderId}`
        )

        if (response.data.success) {
          dispatch(setMessages(response.data.messages))
        }
      }
    } catch (error) {
      console.log(error.message)
      if (
        error?.response?.statusText === "Unauthorized" ||
        error?.response?.status === 403
      ) {
        navigate("/login")
      }
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex dark:bg-neutral-950 dark:text-white">
        {/* Sidebar */}
        <Sidebar compact />
        <div
          className={`${
            suggestedUser ? "w-0" : "w-full"
          } ml-20 md:w-80 border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-neutral-950 dark:text-white`}
        >
          <div className="p-4 border-gray-200 dark:border-zinc-800 dark:bg-neutral-950 dark:text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-semibold flex items-center gap-2 cursor-pointer dark:bg-neutral-950 dark:text-white">
                {userDetails.username} <IoIosArrowDown />
              </span>
            </div>
            <div className="flex space-x-2">
              <SearchDialogWithCheckboxesComponent socketRef={socketRef} />
            </div>
          </div>
          <div className="flex justify-between items-center px-4 py-2 border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-black dark:bg-neutral-950 dark:text-white">
              Messages
            </span>
          </div>
          <MessagesMember socketRef={socketRef} />
        </div>
        {/* Main Chat Area */}
        <ChatBox socketRef={socketRef} />
      </div>
    </div>
  )
}

ChatComponent.propTypes = {
  socketRef: PropTypes.shape({
    current: PropTypes.shape({
      on: PropTypes.func,
      off: PropTypes.func,
    }),
  }).isRequired,
}