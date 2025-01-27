const API_BASE_URL = 'http://localhost:3001';

export interface Job {
  jobId: string;
  processed: number;
  status: string;
  totalEmails: number;
  percentage?: number;
}

export const jobsApi = {
  create: async (totalEmails: number): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ totalEmails }),
    });

    if (!response.ok) {
      throw new Error('Failed to create job');
    }

    const { jobId } = await response.json();
    return jobId;
  },

  subscribeToStatus: (jobId: string, onUpdate: (job: Job) => void, onError: (error: Error) => void) => {
    const eventSource = new EventSource(`${API_BASE_URL}/jobs/${jobId}/progress`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as Job;
      onUpdate(data);
    };

    eventSource.onerror = () => {
      onError(new Error('EventSource failed'));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },

  getAll: async (): Promise<Job[]> => {
    const response = await fetch(`${API_BASE_URL}/jobs`);

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const jobs = await response.json();
    return jobs;
  }
};
