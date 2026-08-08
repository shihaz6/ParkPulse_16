package com.parkpulse.member.repository;

import com.parkpulse.member.model.Member;
import com.parkpulse.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class FileMemberRepository implements MemberRepository {

    private static final String MEMBERS_FILE = "members.txt";

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public List<Member> findAll() {
        return fileStorageService.loadAll(MEMBERS_FILE, Member::fromString).stream()
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Optional<Member> findById(String id) {
        return findAll().stream()
                .filter(m -> m.getId().equals(id))
                .findFirst();
    }

    @Override
    public Member save(Member member) {
        List<Member> members = findAll();
        if (member.getId() == null || member.getId().isEmpty()) {
            member.setId("m" + java.util.UUID.randomUUID().toString().substring(0, 8));
            members.add(member);
        } else {
            boolean found = false;
            for (int i = 0; i < members.size(); i++) {
                if (members.get(i).getId().equals(member.getId())) {
                    members.set(i, member);
                    found = true;
                    break;
                }
            }
            if (!found) {
                members.add(member);
            }
        }
        fileStorageService.saveAll(MEMBERS_FILE, members);
        return member;
    }

    @Override
    public void deleteById(String id) {
        List<Member> members = findAll();
        members.removeIf(m -> m.getId().equals(id));
        fileStorageService.saveAll(MEMBERS_FILE, members);
    }

    @Override
    public void saveAll(List<Member> members) {
        fileStorageService.saveAll(MEMBERS_FILE, members);
    }
}
