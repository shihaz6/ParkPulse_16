package com.parkpulse.member.service;

import com.parkpulse.member.model.Member;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MemberService {
    List<Member> getAllMembers();
    Member updateMember(String id, Member incomingMember);
    Optional<Member> getMemberById(String id);
    Member saveMember(Member member);
    void deleteMember(String id);
    Map<String, Object> getMemberStats();
    Member suspendMember(String id);
    Member activateMember(String id);
    Member deactivateMember(String id);
    Map<String, Object> calculateSubscription(Member member);
}
