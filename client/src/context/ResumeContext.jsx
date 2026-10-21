// Keeps the logged-in user's resumes. Use it with useResumes().
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as resumeService from '../services/resumeService'
import { useAuth } from './AuthContext'

const ResumeContext = createContext(null)

export function ResumeProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id

  // Store the user id with the list so we never show another user's resumes
  const [resumeState, setResumeState] = useState({ userId: null, list: [] })

  useEffect(() => {
    if (!userId) return
    let isCancelled = false
    resumeService
      .getResumes(userId)
      .catch(() => []) // server not reachable: show an empty list instead of loading forever
      .then((list) => {
        if (!isCancelled) setResumeState({ userId, list })
      })
    return () => {
      isCancelled = true
    }
  }, [userId])

  const value = useMemo(() => {
    const updateList = (changeList) => setResumeState((current) => ({ ...current, list: changeList(current.list) }))

    return {
      resumes: userId && resumeState.userId === userId ? resumeState.list : [],
      isResumesLoading: Boolean(userId) && resumeState.userId !== userId,

      createResume: async (resumeData) => {
        const newResume = await resumeService.createResume(userId, resumeData)
        updateList((list) => [newResume, ...list])
        return newResume
      },
      saveResume: async (resumeId, updates) => {
        const savedResume = await resumeService.updateResume(resumeId, updates)
        updateList((list) => [savedResume, ...list.filter((resume) => resume.id !== resumeId)])
        return savedResume
      },
      deleteResume: async (resumeId) => {
        await resumeService.deleteResume(resumeId)
        updateList((list) => list.filter((resume) => resume.id !== resumeId))
      },
      saveScore: async (resumeId, score, extra) => {
        const scoredResume = await resumeService.saveAtsScore(resumeId, score, extra)
        updateList((list) => list.map((resume) => (resume.id === resumeId ? scoredResume : resume)))
      },
      duplicateResume: async (resumeId) => {
        const copy = await resumeService.duplicateResume(resumeId)
        updateList((list) => [copy, ...list])
        return copy
      },
    }
  }, [userId, resumeState])

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

export function useResumes() {
  return useContext(ResumeContext)
}
