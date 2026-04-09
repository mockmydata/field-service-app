import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { JobsAPI } from '../api/api';
import { Job } from '../../types/types';

type JobContextType = {
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
  jobs: Job[];
  loading: boolean;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  fetchJobs: () => Promise<void>;
  addJob: (job: Omit<Job, 'id'>) => Promise<void>;
  updateJob: (job: Job) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
};

const JobContext = createContext<JobContextType | null>(null);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

 const fetchJobs = useCallback(async () => {
  setLoading(true);
  try {
    const data = await JobsAPI.getAll();
    setJobs(Array.isArray(data) ? data : []);
  } catch (e: any) {
    if (e?.response?.status === 429) return;
    Alert.alert('Error', 'Failed to load jobs.');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const addJob = async (job: Omit<Job, 'id'>) => {
  const created = await JobsAPI.create(job);
  setJobs(prev => Array.isArray(prev) ? [...prev, created] : [created]);
};

/*
  const addJob = async (job: Omit<Job, 'id'>) => {
    const created = await JobsAPI.create(job);
    setJobs(prev => [...prev, created]);
  };
*/
  const updateJob = async (job: Job) => {
    const saved = await JobsAPI.update(job.id, job);
    setJobs(prev => prev.map(j => j.id === saved.id ? saved : j));
    setSelectedJob(saved);
    return saved;
  };

  const deleteJob = async (id: string) => {
    await JobsAPI.delete(id);
    setJobs(prev => prev.filter(j => j.id !== id));
    setSelectedJob(null);
  };

  return (
    <JobContext.Provider value={{
      jobs, loading, selectedJob, setSelectedJob,
      selectedDate, setSelectedDate,
      fetchJobs, addJob, updateJob, deleteJob,
    }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobContext() {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJobContext must be used within a JobProvider');
  return ctx;
}