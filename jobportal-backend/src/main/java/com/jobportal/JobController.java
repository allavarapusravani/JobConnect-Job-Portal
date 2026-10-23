
package com.jobportal;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class JobController {

    private final JobRepository jobRepository;

    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // Get all jobs
    @GetMapping
    public List<Job> getJobs() {
        return jobRepository.findAll();
    }

    // Get one job by ID - NEW METHOD
    @GetMapping("/{id}")
    public Optional<Job> getJobById(@PathVariable Long id) {
        return jobRepository.findById(id);
    }

    // Add a new job
    @PostMapping
    public Job addJob(@RequestBody Job job) {
        return jobRepository.save(job);
    }
}
