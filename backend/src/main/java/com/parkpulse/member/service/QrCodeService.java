package com.parkpulse.member.service;

import com.parkpulse.member.model.Member;

public interface QrCodeService {
    String generateMemberQrCode(Member member);
}
