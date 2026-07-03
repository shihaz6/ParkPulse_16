package com.parkpulse.member.repository;

import com.parkpulse.member.model.Member;
import java.util.List;
import java.util.Optional;

public interface MemberRepository {
    List<Member> findAll();
    Optional<Member> findById(String id);
    Member save(Member member);
    void deleteById(String id);
    void saveAll(List<Member> members);
}
