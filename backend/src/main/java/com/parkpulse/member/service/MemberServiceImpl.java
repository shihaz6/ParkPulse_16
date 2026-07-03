package com.parkpulse.member.service;

import com.parkpulse.member.model.Member;
import com.parkpulse.member.model.Plan;
import com.parkpulse.member.repository.MemberRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class MemberServiceImpl implements MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlanService planService;

    @PostConstruct
    public void init() {
        // No default members — members self-register or admin adds them
    }

    @Override
    public List<Member> getAllMembers() {
        List<Member> members = memberRepository.findAll();
        // Exclude passwords from response
        members.forEach(m -> m.setPassword(null));
        return members;
    }

    @Override
    public Member saveMember(Member member) {
        // Generate ID if missing
        if (member.getId() == null || member.getId().isEmpty()) {
            member.setId(UUID.randomUUID().toString());
        }

        // Check uniqueness
        if (member.getUsername() != null && memberRepository instanceof com.parkpulse.member.repository.SqlMemberRepository) {
            com.parkpulse.member.repository.SqlMemberRepository sqlRepo = (com.parkpulse.member.repository.SqlMemberRepository) memberRepository;
            if (sqlRepo.existsByUsername(member.getUsername())) {
                throw new RuntimeException("Username already exists: " + member.getUsername());
            }
            if (sqlRepo.existsByEmail(member.getEmail())) {
                throw new RuntimeException("Email already exists: " + member.getEmail());
            }
        }

        // Hash password if provided
        if (member.getPassword() != null && !member.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(member.getPassword()));
        }

        // Auto-set joinedDate if not provided
        if (member.getJoinedDate() == null || member.getJoinedDate().isEmpty()) {
            member.setJoinedDate(LocalDate.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy")));
        }

        // Set billingCycle based on plan
        if (member.getPlan() != null && (member.getBillingCycle() == null || member.getBillingCycle().isEmpty())) {
            Optional<Plan> planOpt = planService.findPlanByName(member.getPlan());
            if (planOpt.isPresent()) {
                Plan plan = planOpt.get();
                member.setBillingCycle(plan.getAnnualPrice() > 0 ? "ANNUAL" : "MONTHLY");
            } else {
                member.setBillingCycle("MONTHLY");
            }
        }

        // Normalize status to lowercase
        if (member.getStatus() != null) {
            member.setStatus(member.getStatus().toLowerCase());
        }

        Member saved = memberRepository.save(member);
        saved.setPassword(null); // Don't return password
        return saved;
    }

    @Override
    public Member updateMember(String id, Member incomingMember) {
        return memberRepository.findById(id).map(existingMember -> {
            // Only update fields if they are explicitly sent in the request body
            if (incomingMember.getName() != null) existingMember.setName(incomingMember.getName());
            if (incomingMember.getEmail() != null) {
                // Check email uniqueness if changed
                if (!existingMember.getEmail().equals(incomingMember.getEmail())) {
                    if (memberRepository instanceof com.parkpulse.member.repository.SqlMemberRepository) {
                        com.parkpulse.member.repository.SqlMemberRepository sqlRepo = (com.parkpulse.member.repository.SqlMemberRepository) memberRepository;
                        if (sqlRepo.existsByEmail(incomingMember.getEmail())) {
                            throw new RuntimeException("Email already exists: " + incomingMember.getEmail());
                        }
                    }
                }
                existingMember.setEmail(incomingMember.getEmail());
            }
            if (incomingMember.getUsername() != null) {
                // Check username uniqueness if changed
                if (!existingMember.getUsername().equals(incomingMember.getUsername())) {
                    if (memberRepository instanceof com.parkpulse.member.repository.SqlMemberRepository) {
                        com.parkpulse.member.repository.SqlMemberRepository sqlRepo = (com.parkpulse.member.repository.SqlMemberRepository) memberRepository;
                        if (sqlRepo.existsByUsername(incomingMember.getUsername())) {
                            throw new RuntimeException("Username already exists: " + incomingMember.getUsername());
                        }
                    }
                }
                existingMember.setUsername(incomingMember.getUsername());
            }
            if (incomingMember.getPhone() != null) existingMember.setPhone(incomingMember.getPhone());
            if (incomingMember.getPlan() != null) {
                existingMember.setPlan(incomingMember.getPlan());
                // Update billingCycle when plan changes
                Optional<Plan> planOpt = planService.findPlanByName(incomingMember.getPlan());
                if (planOpt.isPresent()) {
                    Plan p = planOpt.get();
                    existingMember.setBillingCycle(p.getAnnualPrice() > 0 ? "ANNUAL" : "MONTHLY");
                } else {
                    existingMember.setBillingCycle("MONTHLY");
                }
            }
            if (incomingMember.getStatus() != null) existingMember.setStatus(incomingMember.getStatus().toLowerCase());
            if (incomingMember.getJoinedDate() != null) existingMember.setJoinedDate(incomingMember.getJoinedDate());
            if (incomingMember.getVehicles() >= 0) existingMember.setVehicles(incomingMember.getVehicles());

            // Hash password if provided (only on explicit change)
            if (incomingMember.getPassword() != null && !incomingMember.getPassword().isEmpty()) {
                existingMember.setPassword(passwordEncoder.encode(incomingMember.getPassword()));
            }

            // Save the tracked database entity back to MySQL
            Member saved = memberRepository.save(existingMember);
            saved.setPassword(null); // Don't return password
            return saved;
        }).orElseThrow(() -> new RuntimeException("Member profile not found with id: " + id));
    }

    @Override
    public Optional<Member> getMemberById(String id) {
        return memberRepository.findById(id).map(m -> {
            m.setPassword(null);
            return m;
        });
    }

    @Override
    public void deleteMember(String id) {
        memberRepository.deleteById(id);
    }

    @Override
    public Member suspendMember(String id) {
        if (id == null || id.isEmpty()) {
            throw new RuntimeException("Member ID is required");
        }
        return memberRepository.findById(id).map(existingMember -> {
            existingMember.setStatus("suspended");
            Member saved = memberRepository.save(existingMember);
            saved.setPassword(null);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Member not found with id: " + id));
    }

    @Override
    public Member activateMember(String id) {
        if (id == null || id.isEmpty()) {
            throw new RuntimeException("Member ID is required");
        }
        return memberRepository.findById(id).map(existingMember -> {
            existingMember.setStatus("active");
            Member saved = memberRepository.save(existingMember);
            saved.setPassword(null);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Member not found with id: " + id));
    }

    @Override
    public Member deactivateMember(String id) {
        if (id == null || id.isEmpty()) {
            throw new RuntimeException("Member ID is required");
        }
        return memberRepository.findById(id).map(existingMember -> {
            existingMember.setStatus("inactive");
            Member saved = memberRepository.save(existingMember);
            saved.setPassword(null);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Member not found with id: " + id));
    }

    @Override
    public Map<String, Object> getMemberStats() {
        List<Member> members = getAllMembers();
        long total = members.size();
        long active = members.stream().filter(m -> "active".equalsIgnoreCase(m.getStatus())).count();
        long inactive = members.stream().filter(m -> "inactive".equalsIgnoreCase(m.getStatus())).count();
        long suspended = members.stream().filter(m -> "suspended".equalsIgnoreCase(m.getStatus())).count();
        long professional = members.stream().filter(m -> "Professional".equalsIgnoreCase(m.getPlan())).count();
        long basic = members.stream().filter(m -> "Basic".equalsIgnoreCase(m.getPlan())).count();
        int totalVehicles = members.stream().mapToInt(Member::getVehicles).sum();

        return Map.of(
                "total", total,
                "active", active,
                "inactive", inactive,
                "suspended", suspended,
                "professional", professional,
                "basic", basic,
                "totalVehicles", totalVehicles
        );
    }

    @Override
    public Map<String, Object> calculateSubscription(Member member) {
        if (member == null || member.getJoinedDate() == null || member.getJoinedDate().isEmpty()) {
            return Map.of("billingCycle", "MONTHLY", "nextRenewalDate", "", "daysRemaining", 0L);
        }

        String billingCycle = member.getBillingCycle();
        if (billingCycle == null || billingCycle.isEmpty()) {
            billingCycle = "MONTHLY";
        }

        try {
            LocalDate joined = LocalDate.parse(member.getJoinedDate(), DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH));
            LocalDate now = LocalDate.now();

            // Calculate next renewal by adding periods until future
            LocalDate nextRenewal = joined;
            int maxIterations = 100;
            int iterations = 0;
            while (!nextRenewal.isAfter(now) && iterations < maxIterations) {
                if ("ANNUAL".equalsIgnoreCase(billingCycle)) {
                    nextRenewal = nextRenewal.plusYears(1);
                } else {
                    nextRenewal = nextRenewal.plusMonths(1);
                }
                iterations++;
            }

            long daysRemaining = ChronoUnit.DAYS.between(now, nextRenewal);
            if (daysRemaining < 0) daysRemaining = 0;

            return Map.of(
                    "billingCycle", billingCycle,
                    "nextRenewalDate", nextRenewal.format(DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH)),
                    "daysRemaining", daysRemaining
            );
        } catch (Exception e) {
            return Map.of("billingCycle", billingCycle, "nextRenewalDate", "", "daysRemaining", 0L);
        }
    }
}