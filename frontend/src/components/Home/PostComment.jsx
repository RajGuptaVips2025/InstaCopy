
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoChatbubbleOutline } from "react-icons/io5";
import { GoBookmark, GoBookmarkFill } from "react-icons/go";
import { useDispatch, useSelector } from 'react-redux';
import { setSavedPosts } from '@/features/userDetail/userDetailsSlice';
import { Link, useNavigate } from 'react-router-dom';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from '../ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import api from '@/api/api';
import PropTypes from 'prop-types';
// import { motion, AnimatePresence } from "framer-motion";


function PostComment({ selectedMedia, isDialogOpen, setIsDialogOpen }) {
  const dispatch = useDispatch();
  const [comment, setComment] = useState('');
  const [isMuted, setIsMuted] = useState(true)
  const [commentsArr, setCommentsArr] = useState([]);
  const PostDetails = useSelector((state) => state.counter.selectedPost);
  const userDetails = useSelector((state) => state.counter.userDetails);
  const savedPosts = useSelector((state) => state.counter.savedPosts);
  const [liked, setLiked] = useState(PostDetails?.likes || []);
  const navigate = useNavigate();

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${PostDetails?._id}/comment`);
      setCommentsArr(response?.data?.comments);
    } catch (error) {
      if (error?.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/posts/${postId}/comment`, {
        userId: userDetails.id,
        text: comment,
      });
      fetchComments();
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')
      setComment('');
    }
  };

  //   const handleRemoveComment = async (e, postId, commentId) => {
  //     e.preventDefault();
  //     try {
  //       const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
  //       if (response.status === 200) {
  //         setCommentsArr(response?.data?.post?.comments);
  //       }
  //     } catch (error) {
  //       console.error('Error removing comment:', error);
  //     }
  //   };

  const handleLike = async (e, postId) => {
    e.preventDefault();
    const userId = userDetails.id;
    try {
      await api.put(`/posts/${postId}/like`, { userId });
      setLiked(prevLiked => {
        const userHasLiked = prevLiked.includes(userId);
        return userHasLiked
          ? prevLiked.filter(id => id !== userId)
          : [...prevLiked, userId];
      });
    } catch (error) {
      console.error('Error liking/unliking the post:', error);
      if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')
    }
  };

  const handleSavePost = async (e, postId) => {
    e.preventDefault();
    const userId = userDetails.id;
    try {
      const response = await api.put(`/posts/${userId}/save`, { postId });
      const savedPosts = response.data.savedPosts;
      dispatch(setSavedPosts(savedPosts));
    } catch (error) {
      if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')
      console.error('Error saving post:', error);
    }
  };

  useEffect(() => {
    if (PostDetails?.likes) setLiked(PostDetails.likes);
  }, [PostDetails]);

  useEffect(() => {
    if (PostDetails?._id) fetchComments();
  }, [PostDetails, liked]);


  return (
    <>
      {selectedMedia && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="sr-only">Open post details</DialogTrigger>
          <DialogContent className="p-0 border-none shadow-none min-w-[60vw] max-w-[70vw] h-[90vh] flex justify-center overflow-hidden items-center sm:rounded-sm">

            <AnimatePresence>
              {isDialogOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex w-full h-full"
                >
                  {/* Left side - Media - FIXED: w-3/5 for 60% width */}
                  <div className="multimedia w-3/5 h-full bg-neutral-950">
                    {selectedMedia?.media?.length > 1 ? (
                      <Carousel className="w-full h-full">
                        <CarouselContent>
                          {selectedMedia?.media.map((mediaItem, index) => (
                            <CarouselItem key={index} className="h-full">
                              <Card className="rounded-sm h-full flex justify-center items-center">
                                <CardContent
                                  onDoubleClick={(e) => handleLike(e, PostDetails._id)}
                                  className="p-0 relative border-[.1px] h-full w-full border-zinc-300 dark:border-zinc-800 rounded-sm overflow-hidden flex justify-center items-center"
                                >
                                  {mediaItem?.mediaType === 'video' ? (
                                    <>
                                      <video
                                        src={mediaItem?.mediaPath}
                                        className="w-full h-full object-contain"
                                        loop
                                        autoPlay
                                        muted={isMuted}
                                        playsInline
                                        preload="auto"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute w-8 h-8 bottom-2 right-2 rounded-full bg-black/50 hover:bg-black/70"
                                        onClick={() => setIsMuted(!isMuted)}
                                      >
                                        {isMuted ? (
                                          <VolumeX className="h-4 w-4 text-white" />
                                        ) : (
                                          <Volume2 className="h-4 w-4 text-white" />
                                        )}
                                      </Button>
                                    </>
                                  ) : (
                                    <motion.img
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.4 }}
                                      src={mediaItem?.mediaPath}
                                      alt={`Post ${index + 1}`}
                                      className="w-full h-full object-contain rounded-sm"
                                      loading="lazy"
                                    />
                                  )}
                                </CardContent>
                              </Card>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1 dark:text-white" />
                        <CarouselNext className="right-1 dark:text-white" />
                      </Carousel>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full flex justify-center items-center" // Added flex centering to single media wrapper
                      >
                        {selectedMedia?.media[0]?.mediaPath?.endsWith(".mp4") ? (
                          <video src={selectedMedia?.media[0]?.mediaPath} autoPlay controls className="w-full h-full rounded-xl object-contain" />
                        ) : (
                          <img
                            src={selectedMedia?.media[0]?.mediaPath}
                            alt="Selected media"
                            className="w-full h-full rounded-xl object-contain"
                          />
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Right side - Comments & actions */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-2/5 h-full rounded-sm dark:bg-neutral-950 dark:text-white flex flex-col justify-between"
                  >
                    {/* Author */}
                    <div className="author border-b-[.1px] border-zinc-800 w-full h-[70px] flex items-center px-4">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={PostDetails?.author?.profilePicture} alt={`${PostDetails?.author?.username}'s profile`} />
                          <AvatarFallback>{PostDetails?.author?.username}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold">{PostDetails?.author?.username}</p>
                      </div>
                      {/* <Button variant="ghost" className="ml-auto text-sky-500 font-bold text-sm">
                        Follow
                      </Button> */}
                    </div>

                    {/* Comments */}
                    <div className={`comments-section flex-1 overflow-y-auto p-4 ${commentsArr?.length === 0 ? 'flex justify-center items-center' : ''}`}>
                      <AnimatePresence>
                        {commentsArr?.length > 0 ? (
                          commentsArr.map((comment) => (
                            <motion.div
                              key={comment._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="mb-4"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3 flex-1">
                                  <Link to={`/profile/${comment?.user?.username}`}>
                                    <Avatar>
                                      <AvatarImage src={comment?.profilePicture} alt={`${comment?.user?.username}'s profile`} />
                                      <AvatarFallback>{comment?.user?.username[0]}</AvatarFallback>
                                    </Avatar>
                                  </Link>
                                  <div className="flex flex-col">
                                    <p className='flex items-center gap-2'>
                                      <strong className='hover:text-zinc-400 text-sm duration-150'>{comment?.user?.username}</strong>
                                      <span className='font-light text-sm'>{comment.text}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-center">No comments yet. Be the first to comment!</p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* <div className="actions border-t-[.1px] border-zinc-800 w-full px-4 py-3">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            transition={{ duration: 0.1 }}
                            className="focus:outline-none"
                            onClick={(e) => handleLike(e, PostDetails?._id)}
                          >
                            <AnimatePresence>
                              {liked.includes(userDetails.id) ? (
                                <motion.div
                                  key="liked"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <FaHeart size={25} className="text-red-500" />
                                </motion.div>
                              ) : (
                                <FaRegHeart size={25} className="hover:text-zinc-500 transition-colors duration-100" />
                              )}
                            </AnimatePresence>
                          </motion.button>

                          <motion.button whileTap={{ scale: 0.9 }}>
                            <IoChatbubbleOutline size={25} className="hover:text-zinc-500 transition-colors duration-100" style={{ transform: 'scaleX(-1)' }} />
                          </motion.button>
                        </div>

                        <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleSavePost(e, PostDetails?._id)}>
                          {Array.isArray(savedPosts) && savedPosts?.includes(PostDetails?._id) ? (
                            <GoBookmarkFill size={25} className="text-white" />
                          ) : (
                            <GoBookmark size={25} className="hover:text-zinc-500 transition-colors duration-100" />
                          )}
                        </motion.button>
                      </div>

                      <div className="my-3 text-sm font-semibold">
                        <p>{liked.length || 0} likes</p>
                      </div>
                    </div>

                    <form onSubmit={(e) => handleCommentSubmit(e, PostDetails._id)} className="comment-input border-t-[.1px] border-zinc-800 w-full px-4 py-3 flex items-center">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        className={`text-blue-500 font-bold text-sm ${!comment.trim() && 'text-zinc-600'}`}
                        disabled={!comment.trim()}
                      >
                        Post
                      </Button>
                    </form> */}

                    {/* Actions Section */}
                    <motion.div
                      className="actions border-t-[.1px] border-zinc-800 w-full px-4 py-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                    >
                      <motion.div
                        className="flex justify-between items-center"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.1,
                            },
                          },
                        }}
                      >
                        {/* <div className="flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="focus:outline-none"
                            onClick={(e) => handleLike(e, PostDetails?._id)}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {liked.includes(userDetails.id) ? (
                                <motion.div
                                  key="liked"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1.3 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                >
                                  <FaHeart size={25} className="text-red-500" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="unliked"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <FaRegHeart
                                    size={25}
                                    className="hover:text-zinc-500 transition-colors duration-100"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <IoChatbubbleOutline
                              size={25}
                              className="hover:text-zinc-500 transition-colors duration-100"
                              style={{ transform: "scaleX(-1)" }}
                            />
                          </motion.button>
                        </div> */}

                        <div className="flex gap-3">
                          {/* Like Button */}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="focus:outline-none"
                            onClick={(e) => handleLike(e, PostDetails?._id)}
                          >
                            {liked.includes(userDetails.id) ? (
                              <FaHeart size={25} className="text-red-500 transition-transform duration-150" />
                            ) : (
                              <FaRegHeart
                                size={25}
                                className="hover:text-zinc-500 transition-transform duration-150"
                              />
                            )}
                          </motion.button>

                          {/* Comment Button */}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <IoChatbubbleOutline
                              size={25}
                              className="hover:text-zinc-500 transition-colors duration-100"
                              style={{ transform: "scaleX(-1)" }}
                            />
                          </motion.button>
                        </div>


                        {/* Save Button */}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={(e) => handleSavePost(e, PostDetails?._id)}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {Array.isArray(savedPosts) && savedPosts?.includes(PostDetails?._id) ? (
                            <GoBookmarkFill size={25} className="text-white" />
                          ) : (
                            <GoBookmark
                              size={25}
                              className="hover:text-zinc-500 transition-colors duration-100"
                            />
                          )}
                        </motion.button>
                      </motion.div>

                      {/* Like Count */}
                      <motion.div
                        className="my-3 text-sm font-semibold"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <p>{liked.length || 0} likes</p>
                      </motion.div>
                    </motion.div>

                    {/* Comment Input */}
                    <motion.form
                      onSubmit={(e) => handleCommentSubmit(e, PostDetails._id)}
                      className="comment-input border-t-[.1px] border-zinc-800 w-full px-4 py-3 flex items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
                    >
                      <motion.input
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="submit"
                          variant="ghost"
                          className={`text-blue-500 font-bold text-sm ${!comment.trim() && "text-zinc-600"
                            }`}
                          disabled={!comment.trim()}
                        >
                          Post
                        </Button>
                      </motion.div>
                    </motion.form>

                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
PostComment.propTypes = {
  selectedMedia: PropTypes.shape({
    media: PropTypes.arrayOf(
      PropTypes.shape({
        mediaPath: PropTypes.string,
        mediaType: PropTypes.string,
      })
    ),
  }),
  isDialogOpen: PropTypes.bool.isRequired,
  setIsDialogOpen: PropTypes.func.isRequired,
};

export default PostComment;



// /* eslint-disable react/prop-types */
// import { useEffect, useState } from 'react';
// import { FaRegHeart } from "react-icons/fa";
// import { IoChatbubbleOutline } from "react-icons/io5";
// import { FiSend } from "react-icons/fi";
// import { GoBookmark } from "react-icons/go";
// import { GoBookmarkFill } from "react-icons/go";
// import { useDispatch, useSelector } from 'react-redux';
// import { setSavedPosts } from '@/features/userDetail/userDetailsSlice';
// import { FaHeart } from "react-icons/fa";
// import { Link, useNavigate } from 'react-router-dom';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
// import { Button } from '../ui/button';
// import { MoreHorizontal, Volume2, VolumeX } from 'lucide-react';
// import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
// import { Card, CardContent } from "../ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
// import api from '@/api/api';


// function PostComment({ selectedMedia, isDialogOpen, setIsDialogOpen }) {
//     const dispatch = useDispatch();
//     const [comment, setComment] = useState('');
//     const [isMuted, setIsMuted] = useState(true)
//     const [commentsArr, setCommentsArr] = useState([]);
//     const PostDetails = useSelector((state) => state.counter.selectedPost);
//     const userDetails = useSelector((state) => state.counter.userDetails);
//     const savedPosts = useSelector((state) => state.counter.savedPosts);
//     const [liked, setLiked] = useState(PostDetails?.likes || []);
//     const navigate = useNavigate()

//     // Fetch comments from the server
//     const fetchComments = async () => {
//         try {
//             const response = await api.get(`/posts/${PostDetails?._id}/comment`);
//             setCommentsArr(response?.data?.comments);
//         } catch (error) {
//             if (error?.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')
//             console.error('Error fetching comments:', error);
//         }
//     };

//     // Submit a new comment
//     const handleCommentSubmit = async (e, postId) => {
//         e.preventDefault();
//         if (!comment.trim()) return;
//         try {
//             await api.post(`/posts/${postId}/comment`, {
//                 userId: userDetails.id,
//                 text: comment,
//             });
//             fetchComments();
//             setComment('');
//         } catch (error) {
//             console.error('Error adding comment:', error);
//             if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')
//             setComment(''); // Clear the input in case of an error
//         }
//     };


//     const handleRemoveComment = async (e, postId, commentId) => {
//         e.preventDefault()
//         try {
//             const response = await api.delete(`/posts/${postId}/comment/${commentId}`);

//             if (response.status === 200) {
//                 setCommentsArr(response?.data?.post?.comments);
//                 // Dispatch an action to update the post in the Redux store if necessary
//             }
//         } catch (error) {
//             console.error('Error removing comment:', error);
//         }
//     };


//     // Handle like/unlike
//     const handleLike = async (e, postId) => {
//         e.preventDefault();
//         const userId = userDetails.id;
//         try {
//             await api.put(`/posts/${postId}/like`, { userId });
//             setLiked(prevLiked => {
//                 const userHasLiked = prevLiked.includes(userId);
//                 if (userHasLiked) {
//                     return prevLiked.filter(id => id !== userId);
//                 } else {
//                     return [...prevLiked, userId];
//                 }
//             });
//         } catch (error) {
//             console.error('Error liking/unliking the post:', error);
//             if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')

//         }
//     };


//     const handleSavePost = async (e, postId) => {
//         e.preventDefault();
//         const userId = userDetails.id;
//         try {
//             const response = await api.put(`/posts/${userId}/save`, {
//                 postId,
//             });
//             const savedPosts = response.data.savedPosts
//             dispatch(setSavedPosts(savedPosts))
//         } catch (error) {
//             if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login')
//             console.error('Error liking/unliking the post:', error);
//         }
//     };

//     // Update `liked` state when `PostDetails` changes
//     useEffect(() => {
//         if (PostDetails?.likes) {
//             setLiked(PostDetails.likes);
//         }
//     }, [PostDetails]);

//     useEffect(() => {

//         if (PostDetails?._id) {
//             fetchComments();
//         }

//     }, [PostDetails, liked]);



//     return (
//         <>
//             {selectedMedia && (
//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                     <DialogTrigger className="sr-only">Open post details</DialogTrigger>
//                     <DialogContent className="p-0 border-none shadow-none min-w-[80vw] max-w-[85vw] h-[90vh] flex justify-center overflow-hidden items-center sm:rounded-sm">
//                         <div className="flex w-full h-full">
//                             <div className="multimedia w-full h-full bg-neutral-950">
//                                 {selectedMedia?.media?.length > 1 ? (
//                                     <Carousel className="w-full h-full">
//                                         <CarouselContent>
//                                             {selectedMedia?.media.map((mediaItem, index) => (
//                                                 <CarouselItem key={index} className="h-full">
//                                                     <Card className="rounded-sm h-full flex justify-center items-center">
//                                                         <CardContent onDoubleClick={(e) => handleLike(e, PostDetails._id)} className="p-0 relative border-[.1px] h-full w-full border-zinc-300 dark:border-zinc-800 rounded-sm overflow-hidden flex justify-center items-center">
//                                                             {mediaItem?.mediaType === 'video' ? (
//                                                                 <>
//                                                                     <video
//                                                                         src={mediaItem?.mediaPath}
//                                                                         className="w-full h-full aspect-square object-contain"
//                                                                         loop
//                                                                         autoPlay
//                                                                         muted={isMuted}
//                                                                         playsInline
//                                                                         preload="auto"
//                                                                     />
//                                                                     <Button
//                                                                         variant="ghost"
//                                                                         size="icon"
//                                                                         className="absolute w-8 h-8 bottom-2 right-2 rounded-full bg-black/50 hover:bg-black/70"
//                                                                         onClick={() => setIsMuted(!isMuted)}
//                                                                     >
//                                                                         {isMuted ? (
//                                                                             <VolumeX className="h-4 w-4 text-white" />
//                                                                         ) : (
//                                                                             <Volume2 className="h-4 w-4 text-white" />
//                                                                         )}
//                                                                         <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
//                                                                     </Button>
//                                                                 </>
//                                                             ) : (
//                                                                 <img
//                                                                     src={mediaItem?.mediaPath}
//                                                                     alt={`Post ${index + 1}`}
//                                                                     className="w-full h-full aspect-square object-contain rounded-sm"
//                                                                     loading="lazy"
//                                                                 />
//                                                             )}
//                                                         </CardContent>
//                                                     </Card>
//                                                 </CarouselItem>
//                                             ))}
//                                         </CarouselContent>
//                                         <CarouselPrevious className="left-1 dark:text-white" />
//                                         <CarouselNext className="right-1 dark:text-white" />
//                                     </Carousel>
//                                 ) : (
//                                     selectedMedia?.media[0]?.mediaPath?.endsWith(".mp4") || selectedMedia?.mediaPath?.endsWith(".webm") ? (
//                                         <video src={selectedMedia?.media[0]?.mediaPath} autoPlay controls className="w-full h-full rounded-xl" />
//                                     ) : (
//                                         <img
//                                             src={selectedMedia?.media[0]?.mediaPath}
//                                             alt="Selected media"
//                                             className="w-full h-full rounded-xl object-contain"
//                                         />
//                                     )
//                                 )}
//                             </div>
//                             <div className="w-full h-full rounded-sm dark:bg-neutral-950 dark:text-white flex flex-col justify-between">
//                                 <div className="author border-b-[.1px] border-zinc-800 w-full h-[70px] flex items-center px-4">
//                                     <div className="flex items-center gap-2">
//                                         <Avatar>
//                                             <AvatarImage className="object-cover object-top" src={PostDetails?.author?.profilePicture} alt={`${PostDetails?.author?.username}'s profile`} />
//                                             <AvatarFallback>{PostDetails?.author?.username}</AvatarFallback>
//                                         </Avatar>
//                                         <div className="authorDetail">
//                                             <p className="text-sm font-semibold">{PostDetails?.author?.username}</p>
//                                         </div>
//                                     </div>
//                                     <div className="ml-auto">
//                                         <Button variant="ghost" className="text-sky-500 font-bold text-sm">
//                                             Follow
//                                         </Button>
//                                     </div>
//                                 </div>

//                                 <div className={`comments-section flex-1 overflow-y-auto p-4 ${commentsArr?.length === 0 ? 'flex justify-center items-center' : ''}`}>
//                                     {commentsArr?.length > 0 ? (
//                                         commentsArr?.map((comment) => (
//                                             <div key={comment._id} className="mb-4">
//                                                 <div className="flex justify-between items-start">
//                                                     <div className='flex items-start gap-3 flex-1'>
//                                                         <Link to={`/profile/${comment?.user?.username}`}>
//                                                             <Avatar>
//                                                                 <AvatarImage src={comment?.profilePicture} alt={`${comment?.user?.username}'s profile`} />
//                                                                 <AvatarFallback>{comment?.user?.username[0]}</AvatarFallback>
//                                                             </Avatar>
//                                                         </Link>
//                                                         <div className="flex flex-col">
//                                                             <p className='flex items-center gap-2'>
//                                                                 <strong className='hover:text-zinc-400 text-sm duration-150'>{comment?.user?.username}</strong>
//                                                                 <span className='font-light text-sm'>{comment.text}</span>
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex items-center gap-2">
//                                                         <Button variant="ghost" size="icon" className="hover:text-zinc-500 transition-colors duration-100">
//                                                             <FaRegHeart size={10} />
//                                                             <span className="sr-only">Like comment</span>
//                                                         </Button>
//                                                         <DropdownMenu>
//                                                             <DropdownMenuTrigger asChild>
//                                                                 <Button variant="ghost" size="icon" className="p-0">
//                                                                     <MoreHorizontal className="w-5 h-5" />
//                                                                     <span className="sr-only">More options</span>
//                                                                 </Button>
//                                                             </DropdownMenuTrigger>
//                                                             <DropdownMenuContent align="end" className="w-60">
//                                                                 <DropdownMenuItem className="text-red-600 justify-center font-bold focus:text-red-600 cursor-pointer">Report</DropdownMenuItem>
//                                                                 <DropdownMenuSeparator />
//                                                                 <DropdownMenuItem onClick={(e) => handleRemoveComment(e, PostDetails?._id, comment?._id)} className="justify-center cursor-pointer text-red-600 font-semibold focus:text-red-600">Delete Message</DropdownMenuItem>
//                                                                 <DropdownMenuSeparator />
//                                                                 <DropdownMenuItem className="justify-center cursor-pointer">Cancel</DropdownMenuItem>
//                                                             </DropdownMenuContent>
//                                                         </DropdownMenu>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <p className="text-center">No comments yet. Be the first to comment!</p>
//                                     )}
//                                 </div>
//                                 <div className="actions border-t-[.1px] border-zinc-800 w-full px-4 py-3">
//                                     <div className="flex justify-between items-center">
//                                         <div className="flex gap-3">
//                                             <Button variant="ghost" size="icon" onClick={(e) => handleLike(e, PostDetails?._id)}>
//                                                 {liked.includes(userDetails.id) ? (
//                                                     <FaHeart size={25} className="text-red-500" />
//                                                 ) : (
//                                                     <FaRegHeart size={25} className="hover:text-zinc-500 transition-colors duration-100" />
//                                                 )}
//                                                 <span className="sr-only">{liked.includes(userDetails.id) ? 'Unlike' : 'Like'}</span>
//                                             </Button>
//                                             <Button variant="ghost" size="icon">
//                                                 <IoChatbubbleOutline size={25} className="hover:text-zinc-500 transition-colors duration-100" style={{ transform: 'scaleX(-1)' }} />
//                                                 <span className="sr-only">Comment</span>
//                                             </Button>
//                                             <Button variant="ghost" size="icon">
//                                                 <FiSend size={25} className="hover:text-zinc-500 transition-colors duration-100" />
//                                                 <span className="sr-only">Share</span>
//                                             </Button>
//                                         </div>
//                                         <Button variant="ghost" size="icon" onClick={(e) => handleSavePost(e, PostDetails?._id)}>
//                                             {Array.isArray(savedPosts) && savedPosts?.includes(PostDetails?._id) ? (
//                                                 <GoBookmarkFill size={25} className="text-white" />
//                                             ) : (
//                                                 <GoBookmark size={25} className="hover:text-zinc-500 transition-colors duration-100" />
//                                             )}
//                                             <span className="sr-only">{Array.isArray(savedPosts) && savedPosts?.includes(PostDetails?._id) ? 'Unsave' : 'Save'}</span>
//                                         </Button>
//                                     </div>
//                                     <div className="my-3 text-sm font-semibold">
//                                         <p>{liked.length || 0} likes</p>
//                                     </div>
//                                 </div>

//                                 <div className="comment-input border-t-[.1px] border-zinc-800 w-full px-4 py-3">
//                                     <form onSubmit={(e) => handleCommentSubmit(e, PostDetails._id)} className="flex items-center">
//                                         <input
//                                             type="text"
//                                             placeholder="Add a comment..."
//                                             value={comment}
//                                             onChange={(e) => setComment(e.target.value)}
//                                             className="flex-1 bg-transparent outline-none text-sm"
//                                             aria-label="Add a comment"
//                                         />
//                                         <Button
//                                             type="submit"
//                                             variant="ghost"
//                                             className={`text-blue-500 font-bold text-sm ${!comment.trim() && 'text-zinc-600'}`}
//                                             disabled={!comment.trim()}
//                                         >
//                                             Post
//                                         </Button>
//                                     </form>
//                                 </div>
//                             </div>
//                         </div>
//                     </DialogContent>
//                 </Dialog>
//             )}
//         </>

//     );
// }

// export default PostComment;