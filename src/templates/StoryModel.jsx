import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth} from "@clerk/clerk-react"
import api from '../api/axios'

const StoryModel = ({setModel, fetchStories}) => {
  // Story background gradients
  const storyGradients = [
    "bg-gradient-to-tr from-purple-500 to-pink-500",
    "bg-gradient-to-tr from-cyan-500 to-blue-500",
    "bg-gradient-to-tr from-orange-500 to-red-600",
    "bg-gradient-to-tr from-emerald-500 to-lime-500",
    "bg-gradient-to-tr from-pink-500 to-yellow-400",
    "bg-gradient-to-tr from-indigo-600 to-purple-700"
  ]

  const {getToken} = useAuth()

  const [mode, setMode] = useState("text") // Mode: 'text' or 'media'
  const [background, setBackground] = useState(storyGradients[0]) // Selected background gradient
  const [text, setText] = useState("") // Story text
  const [media, setMedia] = useState(null) // Selected media file
  const [previewUrl, setPreviewUrl] = useState(null) // Media preview URL

  const MAX_VIDEO_DURATION = 60 // in seconds
  const MAX_VIDEO_SIZE_MB = 50 // max size for videos

  // Handle media upload
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0]
    if(file){
      if(file.type.startsWith("video")){
        if(file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024){
          toast.error("Video size exceeds 50mb!")
          setMedia(null)
          setPreviewUrl(null)
          return
        }
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadeddata = () => {
          window.URL.revokeObjectURL(file)
          if(video.duration > MAX_VIDEO_DURATION){
            toast.error("Video duration cannot exceed 1 minute.")
            setMedia(null)
            setPreviewUrl(null)
          }else{
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
            setText("")
            setMode("media")
          }
        }
        video.src = URL.createObjectURL(file)
      } else if (file.type.startsWith("image")) {
        setMedia(file)
        setPreviewUrl(URL.createObjectURL(file))
        setText("")
        setMode("media")
      }
    }
  }

  // Change story background
  const changeColor = (index) => setBackground(storyGradients[index])

  // Handle story creation
  const handleCreateStory = async () => {
    const token = await getToken()
    const media_type = mode === "media" ? (media?.type.startsWith('image') ? "image" : "video") : "text"

    if(media_type === "text" && !text) {
      toast.error("Please add some text!")
      return
    }

    let formData = new FormData()
    formData.append('content', text)
    formData.append("media_type", media_type)
    formData.append("media", media)
    formData.append("background_color", background)

    try {
      const {data} = await api.post('/api/story/create', formData, {
        headers : { Authorization : `Bearer ${token}` }
      })

      if(data.success){
        setModel(false)
        toast.success("Story was created successfully")
        fetchStories()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    // Modal wrapper
    <section className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur p-4 sm:p-8 overflow-auto'>
      {/* Close button */}
      <i onClick={()=>setModel(false)} className="absolute top-3 right-3 sm:top-5 sm:right-5 text-3xl cursor-pointer ri-close-circle-line text-white"></i>
      
      {/* Modal title */}
      <h2 className='text-2xl sm:text-4xl font-[acma-black] mb-4 text-center'>Share Your Moment!</h2>

      {/* Story preview box */}
      <div className={`rounded-lg relative ${background} w-full max-w-md h-72 sm:h-96 flex items-center justify-center overflow-hidden`}>
        {mode === "text" && (
          <textarea
            placeholder='Say it loud without saying a word...'
            value={text}
            onChange={(e)=>setText(e.target.value)}
            className='bg-transparent text-white w-full h-full p-3 sm:p-6 text-base sm:text-lg resize-none focus:outline-none'
          />
        )}
        {mode === "media" && previewUrl && (
          media?.type.startsWith('image') ?
          <img src={previewUrl} className='object-contain w-full h-full' /> :
          <video className='object-contain w-full h-full' src={previewUrl} controls />
        )}
      </div>

      {/* Background selector */}
      <div className='flex mt-4 gap-2 flex-wrap justify-center'>
        {storyGradients.map((color,index)=>(
          <button key={index} onClick={()=>changeColor(index)} className={`w-6 h-6 rounded-full ring cursor-pointer ${color}`} />
        ))}
      </div>

      {/* Mode selector */}
      <div className='flex gap-2 mt-4 flex-col sm:flex-row w-full max-w-md'>
        <button onClick={()=>{setMode('text'); setMedia(null); setPreviewUrl(null)}} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${mode==="text"?"bg-white text-black":"bg-zinc-800 text-white"}`}>
          <i className="ri-quote-text text-lg"></i> Text
        </button>
        <label className={`flex flex-1 items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode==="media"?"bg-white text-black":"bg-zinc-800 text-white"}`}>
          <input type="file" accept='image/*,video/*' className='hidden' onChange={(e)=>{handleMediaUpload(e); setMode('media')}} />
          <i className="ri-file-upload-fill text-lg"></i> Photo/Video
        </label>
      </div>

      {/* Create Story button */}
      <button 
        onClick={()=>toast.promise(handleCreateStory(), {loading:"Saving..."})} 
        className="flex items-center justify-center text-lg sm:text-xl mt-4 px-5 sm:px-8 py-2 sm:py-3 rounded-2xl font-[acma-black] text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <i className="ri-sparkling-2-line text-lg sm:text-xl mr-2"></i> Create Story
      </button>
    </section>
  )
}

export default StoryModel
