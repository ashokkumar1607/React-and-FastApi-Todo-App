import {useState,useEffect} from 'react'
import api from './api'
import './App.css'

const App =()=>{
  const [todos,setTodos]=useState([])
  const [formData,setFormData]=useState({
    title:'',
    description:'',
  })

    const fetchTodos = async()=>{
    const response = await api.get('/todos')
    setTodos(response.data)
  }
  
  useEffect(()=>{
    fetchTodos()
  },[])

  const handleInputChange = (event) =>{
    const {name,value}=event.target
    setFormData(prev=>{
      return {
        ...prev,
        [name]:value
      }
    })
  }
  const handleFormSubmit = async (event)=>{
    event.preventDefault()
    if(formData.id){
      await api.put(`/todo/${formData.id}`,formData)
    }else{
      await api.post('/todos',formData)
    }
    fetchTodos()
    setFormData({
        title:'',
        description:'',
    })
    
  }
  
  const handleDelete = async(id)=>{
    await api.delete(`/todo/${id}`)
    fetchTodos()
  }

  const fetchTodo =async (id)=>{
    const response = await api.get(`/todo/${id}`)
    setFormData(response.data)  
  }
  return (
    <div className='w-[50%] max-w-[800px] m-auto mt-12 ring-1 px-5 bg-gray-700 text-white font-sans'>
      <form onSubmit={handleFormSubmit} className='flex flex-col items-center mb-5'>
        <label htmlFor="title" className="self-start py-2 text-2xl">
          Title
        </label>
        <input id="title" type="text" name='title' value={formData.title} onChange={handleInputChange} className='w-full text-slate-900 rounded-lg h-10 py-2 text-xl pl-2'/>
        <label htmlFor="description" className="self-start py-2 text-2xl ">
          Description
        </label>
        <input id="description" type="text" name="description" value={formData.description} onChange={handleInputChange} className='w-full text-slate-900 rounded-lg h-10 text-xl pl-2'/>
        <button type="submit" className='bg-blue-500 hover:bg-blue-900 rounded-full px-5 py-2 mt-5'>Add Todo</button>
      </form>

      <div className='flex flex-col items-center'>
        <h1 className="text-4xl pb-5">Your Tasks</h1>
        {todos.map(todo=>{
          return (
            <h1 className='self-center p-2 ' key={todo.id}>{todo.title} : {todo.description} <span><button className='bg-blue-500 rounded-full px-5 py-2 hover:bg-blue-900'   onClick={()=>fetchTodo(todo.id)}>Edit</button></span> <span><button className='bg-red-500 rounded-full px-5 py-2 hover:bg-red-900 flex-nowrap' onClick={()=>handleDelete(todo.id)}>Delete</button></span> </h1>
                )
        })} 
      </div>
    </div>
  )
}
export default App