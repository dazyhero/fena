"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { jobsApi } from "./services/api/jobs";
import { useToast } from "@/hooks/use-toast";

interface JobStatus {
  id: string;
  progress: number;
  status: string;
  totalEmails?: number;
}

export default function Home() {
  const [emailCount, setEmailCount] = useState("");
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 3;
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const fetchedJobs = await jobsApi.getAll();
        setJobs(fetchedJobs.map(job => ({
          id: job.jobId,
          progress: job.status === 'Completed' ? 100 : (job.percentage ?? 0),
          status: job.status,
          totalEmails: job.totalEmails
        })));

        // Attach SSE listeners to incomplete jobs
        fetchedJobs.forEach(job => {
          if (job.status !== 'Completed') {
            const cleanup = jobsApi.subscribeToStatus(
              job.jobId,
              (jobData) => {
                setJobs(prevJobs =>
                  prevJobs.map(prevJob =>
                    prevJob.id === job.jobId
                      ? {
                        ...prevJob,
                        progress: jobData.status === 'Completed' ? 100 : (jobData.percentage ?? 0),
                        status: jobData.status
                      }
                      : prevJob
                  )
                );

                if (jobData.status === 'Completed') {
                  cleanup();
                }
              },
              (error) => {
                console.error('Failed to receive job updates:', error);
              }
            );
          }
        });

      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch jobs.",
        });
      }
    };

    fetchJobs();
  }, [toast]);

  const handleCreateJob = async () => {
    const count = parseInt(emailCount);
    if (isNaN(count) || count <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid number greater than 0",
      });
      return;
    }

    try {
      const jobId = await jobsApi.create(count);

      // Add new job to the beginning of the list
      setJobs(prev => [{
        id: jobId,
        progress: 0,
        status: 'Pending',
        totalEmails: count
      }, ...prev]);

      setEmailCount("");

      toast({
        description: "Job created successfully!",
      })

      // Subscribe to SSE updates
      const cleanup = jobsApi.subscribeToStatus(
        jobId,
        (jobData) => {
          setJobs(prevJobs =>
            prevJobs.map(prevJob =>
              prevJob.id === jobId
                ? {
                  ...prevJob,
                  progress: jobData.status === 'Completed' ? 100 : (jobData.percentage ?? 0),
                  status: jobData.status
                }
                : prevJob
            )
          );

          if (jobData.status === 'Completed') {
            cleanup();
          }
        },
        (error) => {
          console.error('Failed to receive job updates:', error);
        }
      );
    } catch (error) {
      console.error('Failed to create job:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create job. Please try again.",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateJob();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-center text-2xl font-bold">Create Email Job</h1>
        <div className="flex gap-2">
          <Input
            type="number"
            value={emailCount}
            onChange={(e) => setEmailCount(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Number of emails to create..."
            className="flex-1"
            min="1"
          />
          <Button onClick={handleCreateJob} size="icon" title="Create Email Job">
            <PlayCircle className="h-4 w-4" />
          </Button>
        </div>

        {jobs.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold">Previous Jobs</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobs
                .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
                .map((job) => (
                  <div key={job.id} className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Job ID:</span>
                      <span className="font-mono">{job.id}</span>
                    </div>
                    {job.totalEmails && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Emails:</span>
                        <span>{job.totalEmails}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">{job.status}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 ease-out"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
            {jobs.length > jobsPerPage && (
              <div className="p-4 border-t">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      />
                    </PaginationItem>
                    {(() => {
                      const totalPages = Math.ceil(jobs.length / jobsPerPage);
                      const pages = [];

                      // Always show first page
                      if (currentPage > 2) {
                        pages.push(
                          <PaginationItem key={1}>
                            <PaginationLink onClick={() => setCurrentPage(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                        );
                        if (currentPage > 3) {
                          pages.push(
                            <PaginationItem key="ellipsis1">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                      }

                      // Current page and surrounding pages
                      for (let i = Math.max(1, currentPage - 1);
                        i <= Math.min(totalPages, currentPage + 1);
                        i++) {
                        pages.push(
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(i)}
                              isActive={currentPage === i}
                            >
                              {i}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      // Show last page
                      if (currentPage < totalPages - 1) {
                        if (currentPage < totalPages - 2) {
                          pages.push(
                            <PaginationItem key="ellipsis2">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        pages.push(
                          <PaginationItem key={totalPages}>
                            <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      return pages;
                    })()}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev =>
                          Math.min(Math.ceil(jobs.length / jobsPerPage), prev + 1)
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
