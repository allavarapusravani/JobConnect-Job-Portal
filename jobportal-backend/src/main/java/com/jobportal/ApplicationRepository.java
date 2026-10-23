
package com.jobportal;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    // Get all applicants for a particular job
    List<Application> findByJobId(Long jobId);
}
