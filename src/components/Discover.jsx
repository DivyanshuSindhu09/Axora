import React, { useEffect, useState } from 'react'
import { dummyConnectionsData } from '../../public/assets/assets'
import UserCard from '../templates/UserCard'
import Loading from '../templates/Loading'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchUser } from '../features/user/userSlice'

const Discover = () => {

  const dispatch = useDispatch()

  const [input, setInput] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const {getToken} = useAuth()

  const handleSearch = async (e) => {
    const token = await getToken()
    if(e.key === 'Enter'){
      try {
        setUsers([]) // clear previous search results
        setLoading(true)
        const {data} = await api.post('api/user/discover', {input},{
          headers : {
            Authorization : `Bearer ${token}`
          }
        })
        // if search success, set users; else show toast
        data.success ? setUsers(data.users) : toast.error(data.message)
        setLoading(false)
        setInput('')
      } catch (error) {
        toast.error(error.message)
        setLoading(false)
      }
    }
  }

  useEffect(()=>{
    getToken().then((token) => {
      dispatch(fetchUser(token)) // fetch current user on mount
    })
  }, [])

  return (
    <section className='min-h-screen max-h-screen overflow-y-scroll no-scrollbar text-white bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden'>
      {/* background gradients */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent'></div>
      <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]'></div>
      
      <div className='relative z-10 max-w-6xl mx-auto p-4 sm:p-6'>

        {/* Title */}
        <div className='mb-6 sm:mb-8 text-center sm:text-left'>
          <h1 className='text-3xl sm:text-4xl font-[acma-black] mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-2xl'>
            Discover People
          </h1>
          <p className='font-[absans] text-gray-300 text-sm sm:text-lg'>
            Connect with amazing people and grow your network!
          </p>
        </div>

        {/* search */}
        <div className='mb-6 sm:mb-8 shadow-2xl shadow-purple-500/20 rounded-2xl border border-purple-400/30 bg-gradient-to-r from-slate-800/80 via-gray-800/80 to-slate-800/80 backdrop-blur-xl'>
          <div className='p-4 sm:p-6'>
            <div className='relative group'>
              {/* search icon */}
              <i className="text-xl sm:text-2xl absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 ri-search-line text-purple-400 group-focus-within:text-cyan-400 transition-colors duration-300"></i>
              {/* input field */}
              <input
                //! important event
                onKeyUp={handleSearch}
                placeholder='Search people by name, username, bio, or location...'
                onChange={(e)=>setInput(e.target.value)}
                value={input}
                className='pl-10 sm:pl-12 py-3 sm:py-4 w-full border border-purple-400/20 rounded-xl max-sm:text-sm font-[absans] bg-gradient-to-r from-slate-900/60 to-gray-900/60 text-white placeholder-gray-400 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all duration-300 focus:bg-slate-900/80'
                type="text" 
              />
              {/* input focus background */}
              <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
            </div>
          </div>
        </div>

        {/* user cards */}
        <div className='flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6'>
          {
            users.map((user)=>(
              <UserCard user={user} key={user._id} />
            ))
          }
        </div>

        {/* loading */}
        {
          loading && <Loading height='60vh'/>
        }

      </div>
    </section>
  )
}

export default Discover
