package com.parkpulse.member.repository;

import com.parkpulse.member.model.Member;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class SqlMemberRepository implements MemberRepository {

    @Autowired
    private SpringDataMemberRepository springDataMemberRepository;

    @Override
    public List<Member> findAll() {
        try {
            System.out.println("🔍 [SqlMemberRepository] findAll() called");
            List<Member> members = springDataMemberRepository.findAll();
            System.out.println("✅ [SqlMemberRepository] Found " + members.size() + " members");
            return members;
        } catch (Exception e) {
            System.err.println("❌ [SqlMemberRepository] Error in findAll(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    @Override
    public Optional<Member> findById(String id) {
        return springDataMemberRepository.findById(id);
    }

    @Override
    public Member save(Member member) {
        return springDataMemberRepository.save(member);
    }

    @Override
    public void deleteById(String id) {
        springDataMemberRepository.deleteById(id);
    }

    @Override
    public void saveAll(List<Member> members) {
        springDataMemberRepository.saveAll(members);
    }

    public boolean existsByUsername(String username) {
        return springDataMemberRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return springDataMemberRepository.existsByEmail(email);
    }
}
