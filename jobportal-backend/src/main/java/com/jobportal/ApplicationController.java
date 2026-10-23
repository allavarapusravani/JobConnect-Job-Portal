
package com.jobportal;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final JavaMailSender mailSender;

    public ApplicationController(
            ApplicationRepository applicationRepository,
            JavaMailSender mailSender) {
        this.applicationRepository = applicationRepository;
        this.mailSender = mailSender;
    }

    // Submit application and send confirmation email
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Map<String, Object>> submitApplication(
        @RequestParam Long jobId,
        @RequestParam String applicantName,
        @RequestParam String applicantEmail,
        @RequestParam String phoneNumber,
        @RequestParam String address,
        @RequestParam("resume") MultipartFile resume)
        throws IOException {

    if (resume.isEmpty()) {
        throw new IllegalArgumentException(
            "Please upload your resume.");
    }

    if (!"application/pdf".equalsIgnoreCase(
            resume.getContentType())
            && (resume.getOriginalFilename() == null
            || !resume.getOriginalFilename()
                .toLowerCase().endsWith(".pdf"))) {
        throw new IllegalArgumentException(
            "Only PDF resumes are allowed.");
    }

    Application application = new Application();
    application.setJobId(jobId);
    application.setApplicantName(applicantName);
    application.setApplicantEmail(applicantEmail);
    application.setPhoneNumber(phoneNumber);
    application.setAddress(address);
    application.setResume(resume.getBytes());
    application.setResumeFileName(
        resume.getOriginalFilename());

    // Save application first
    Application savedApplication =
        applicationRepository.save(application);

    // Track the actual email sending result
    boolean emailSent = false;

    try {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(savedApplication.getApplicantEmail());
        message.setSubject(
            "JobConnect - Application Submitted Successfully");

        message.setText(
            "Hi " + savedApplication.getApplicantName()
            + ",\n\n"
            + "Your job application has been submitted "
            + "successfully on JobConnect.\n\n"
            + "Application ID: " + savedApplication.getId() + "\n"
            + "Job ID: " + savedApplication.getJobId() + "\n\n"
            + "Please keep this email for your reference.\n\n"
            + "Thank you for using JobConnect!\n"
            + "JobConnect Team"
        );

        mailSender.send(message);
        emailSent = true;

    } catch (Exception e) {
        System.err.println(
            "Confirmation email could not be sent.");
        e.printStackTrace();
    }

    // Send application and email result to frontend
    return ResponseEntity.ok(
        Map.of(
            "applicationId", savedApplication.getId(),
            "jobId", savedApplication.getJobId(),
            "emailSent", emailSent
        )
    );
}
    

    // Get all applications
    @GetMapping
    public List<Application> getAllApplications() {
        return applicationRepository.findAll()
            .stream()
            .map(this::createResponse)
            .toList();
    }

    // Get applications for a particular job
    @GetMapping("/job/{jobId}")
    public List<Application> getApplicationsByJob(
            @PathVariable Long jobId) {
        return applicationRepository.findByJobId(jobId)
            .stream()
            .map(this::createResponse)
            .toList();
    }

    // Applicant: Get status for one application
    @GetMapping("/{id}/status")
    public ResponseEntity<?> getApplicationStatus(
            @PathVariable Long id) {

        return applicationRepository.findById(id)
            .map(application -> ResponseEntity.ok(
                Map.of(
                    "applicationId", application.getId(),
                    "jobId", application.getJobId(),
                    "applicantName",
                        application.getApplicantName(),
                    "status",
                        getSafeStatus(application.getStatus())
                )
            ))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    // Recruiter: Update application status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        if (!status.equals("Shortlisted")
                && !status.equals("Rejected")) {
            return ResponseEntity.badRequest()
                .body("Status must be Shortlisted or Rejected.");
        }

        return applicationRepository.findById(id)
            .map(application -> {
                application.setStatus(status);
                applicationRepository.save(application);

                return ResponseEntity.ok(
                    "Application status updated to " + status);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Download applicant resume
    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(
            @PathVariable Long id) {

        return applicationRepository.findById(id)
            .map(application -> ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\""
                        + safeFileName(
                            application.getResumeFileName())
                        + "\"")
                .body(application.getResume()))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Copy application fields without returning PDF bytes
    private Application createResponse(Application application) {
        Application response = new Application();

        response.setId(application.getId());
        response.setJobId(application.getJobId());
        response.setApplicantName(application.getApplicantName());
        response.setApplicantEmail(application.getApplicantEmail());
        response.setPhoneNumber(application.getPhoneNumber());
        response.setAddress(application.getAddress());
        response.setResumeFileName(
            application.getResumeFileName());
        response.setStatus(getSafeStatus(application.getStatus()));

        return response;
    }

    // Default status for older applications
    private String getSafeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Pending";
        }
        return status;
    }

    // Keep resume filename safe
    private String safeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "resume.pdf";
        }
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}


