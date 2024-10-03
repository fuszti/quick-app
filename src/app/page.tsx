'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import axios, { AxiosError } from 'axios'

export default function Home() {
  console.log('Rendering Home component')
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    console.log('Home component mounted')
    return () => {
      console.log('Home component unmounted')
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    console.log('Topic changed:', topic)
  }, [topic])

  useEffect(() => {
    console.log('Result changed:', result)
  }, [result])

  useEffect(() => {
    console.log('Loading state changed:', loading)
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submitted')
    e.preventDefault()
    setLoading(true)
    console.log('Setting loading to true')
    try {
      console.log('Sending request to /api/ask-llm')
      const response = await axios.post('/api/ask-llm', {
        message: `You are tasked with creating a completely fabricated "fact" based on a given topic. This fake fact should be entirely fictional and not based on any real information. Your goal is to create something that sounds plausible but is entirely made up.

Guidelines for creating your fake fact:
- Make it specific and detailed
- Include fictional names, dates, or statistics to make it sound more credible
- Ensure it's not accidentally true by making it outlandish enough
- Try to make it somewhat humorous or absurd

The topic for your fake fact is:
<topic>${topic}</topic>

Create your fake fact based on this topic and present it as if it were a real, interesting piece of trivia. Write your fabricated fact inside <result> tags.

Remember, the "fact" you create should be completely fictional. Do not include any true information or attempt to verify anything you're stating. This is an exercise in creative fiction disguised as fact.`,
        model: 'claude-3.5-sonnet' // Changed from 'gpt-4o' to a valid model name
      })
      console.log('Received response:', response.data)
      if (mounted.current) {
        setResult(response.data.result || 'No result received')
        console.log('Result set successfully')
      }
    } catch (error) {
      console.error('Error occurred during API call:', error)
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        if (axiosError.response) {
          console.error('Error data:', axiosError.response.data)
          console.error('Error status:', axiosError.response.status)
        } else if (axiosError.request) {
          console.error('No response received:', axiosError.request)
        } else {
          console.error('Error message:', axiosError.message)
        }
      } else {
        console.error('Non-Axios error:', error)
      }
      if (mounted.current) {
        setResult('An error occurred while fetching the result.')
        setErrors(error instanceof Error ? error.message : String(error))
        console.log('Error message set')
      }
    }
    if (mounted.current) {
      setLoading(false)
      console.log('Setting loading to false')
    }
  }

  console.log('Rendering UI')
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LLM Topic Explorer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={topic}
          onChange={(e) => {
            console.log('Input changed:', e.target.value)
            setTopic(e.target.value)
          }}
          placeholder="Enter a topic"
          className="w-full"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Overview'}
        </Button>
      </form>
      {result && (
        <div className="space-y-4 mt-4">
          <Textarea
            value={result}
            readOnly
            className="w-full h-40"
          />
        </div>
      )}
      {errors && <p className="text-red-500 mt-4">{errors}</p>}
    </main>
  )
}
