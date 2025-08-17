import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth} from "@clerk/clerk-react"
import api from '../api/axios'

const StoryModel = ({setModel, fetchStories}) => {
  const storyGradients = [
    "bg-gradient-to-tr from-purple-500 to-pink-500",
    "bg-gradient-to-tr from-cyan-500 to-blue-500",
    "bg-gradient-to-tr from-orange-500 to-red-600",
    "bg-gradient-to-tr from-emerald-500 to-lime-500",
    "bg-gradient-to-tr from-pink-500 to-yellow-400",
    "bg-gradient-to-tr from-indigo-600 to-purple-700"
  ]

  const {getToken} = useAuth()

  const [mode, setMode] = useState("text")
  const [background, setBackground] = useState(storyGradients[0])
  const [text, setText] = useState("")
  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const MAX_VIDEO_DURATION = 60
  const MAX_VIDEO_SIZE_MB = 50

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

  const changeColor = (index) => setBackground(storyGradients[index])

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
    <section className='w-full h-screen flex items-center justify-center flex-col fixed bg-black/80 text-white top-0 left-0 z-50 backdrop-blur'>
      <i onClick={()=>setModel(false)} className="absolute top-3 sm:top-5 right-3 sm:right-5 text-3xl cursor-pointer ri-close-circle-line"></i>
      <h2 className='text-3xl sm:text-4xl font-[acma-black] mb-4'>Share Your Moment!</h2>

      <div className={`rounded-lg z-100 flex items-center justify-center relative ${background} w-[90vw] sm:w-150 h-[60vh] sm:h-96`}>
        {mode === "text" && (
          <textarea
            placeholder='Say it loud without saying a word...'
            value={text}
            onChange={(e)=>setText(e.target.value)}
            className='font-[absans] bg-transparent text-white w-full h-full p-4 sm:p-6 text-lg sm:text-xl resize-none focus:outline-none'
          />
        )}
        {mode === "media" && previewUrl && (
          media?.type.startsWith('image') ?
          <img src={previewUrl} className='object-contain max-h-full w-full' /> :
          <video className='object-contain max-h-full w-full' src={previewUrl} />
        )}
      </div>

      <div className='flex mt-4 gap-2 flex-wrap justify-center'>
        {storyGradients.map((color,index)=>(
          <button key={index} onClick={()=>changeColor(index)} className={`w-6 h-6 rounded-full ring cursor-pointer ${color}`} />
        ))}
      </div>

      <div className='flex gap-2 mt-4 flex-col sm:flex-row w-[90vw] sm:w-150'>
        <button onClick={()=>{setMode('text'); setMedia(null); setPreviewUrl(null)}} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${mode==="text"?"bg-white text-black":"bg-zinc-800"}`}>
          <i className="ri-quote-text text-xl"></i> Text
        </button>
        <label className={`flex flex-1 items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode==="media"?"bg-white text-black":"bg-zinc-800"}`}>
          <input type="file" accept='image/*,video/*' className='hidden' onChange={(e)=>{handleMediaUpload(e); setMode('media')}} />
          <i className="ri-file-upload-fill text-xl"></i> Photo/Video
        </label>
      </div>

      <button onClick={()=>toast.promise(handleCreateStory(), {loading:"Saving..."})} className="relative flex items-center justify-center text-xl cursor-pointer font-[acma-black] px-6 sm:px-8 py-2 sm:py-3 mt-4 rounded-2xl font-semibold text-white tracking-wide bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
        <i className="ri-sparkling-2-line text-lg"></i> Create Story
      </button>
    </section>
  )
}

export default StoryModel
