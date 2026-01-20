package com.company.erp.common.util;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-GCM 알고리즘을 이용한 보안 강화 암복호화 유틸리티
 */
public final class AesCryptoUtil {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128; // 16 bytes tag
    private static final int IV_LENGTH_BYTES = 12; // GCM 권장 12 bytes

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private AesCryptoUtil() {
    }

    /**
     * 문자열 암호화
     * 
     * @param plain     평문
     * @param keyBase64 Base64 인코딩된 AES 키 (16/24/32 bytes)
     * @return Base64( iv + cipherTextWithTag )
     */
    public static String encrypt(String plain, String keyBase64) {
        if (plain == null || plain.isEmpty())
            return plain;

        try {
            byte[] key = Base64.getDecoder().decode(keyBase64);
            validateKeyLength(key);

            byte[] iv = new byte[IV_LENGTH_BYTES];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);

            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);
            byte[] cipherBytes = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));

            // iv + cipherBytes 를 합쳐서 base64로 저장
            ByteBuffer bb = ByteBuffer.allocate(iv.length + cipherBytes.length);
            bb.put(iv);
            bb.put(cipherBytes);

            return Base64.getEncoder().encodeToString(bb.array());

        } catch (Exception e) {
            // 암호화 실패 시 예외 발생 (저장 방지)
            throw new IllegalStateException("AES 암호화 실패", e);
        }
    }

    /**
     * 문자열 복호화
     * 
     * @param encrypted Base64( iv + cipherTextWithTag )
     * @param keyBase64 Base64 인코딩된 AES 키
     * @return 복호화된 평문
     */
    public static String decrypt(String encrypted, String keyBase64) {
        if (encrypted == null || encrypted.isEmpty())
            return encrypted;

        try {
            byte[] key = Base64.getDecoder().decode(keyBase64);
            validateKeyLength(key);

            byte[] all = Base64.getDecoder().decode(encrypted);

            if (all.length < IV_LENGTH_BYTES + 1) {
                throw new IllegalArgumentException("유효하지 않은 암호화 데이터입니다.");
            }

            byte[] iv = new byte[IV_LENGTH_BYTES];
            byte[] cipherBytes = new byte[all.length - IV_LENGTH_BYTES];

            System.arraycopy(all, 0, iv, 0, IV_LENGTH_BYTES);
            System.arraycopy(all, IV_LENGTH_BYTES, cipherBytes, 0, cipherBytes.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);

            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);
            byte[] plainBytes = cipher.doFinal(cipherBytes);

            return new String(plainBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            // 복호화 실패 시 예외 발생 (보안 사고 탐지 및 위변조 방지)
            throw new IllegalStateException("AES 복호화 실패", e);
        }
    }

    private static void validateKeyLength(byte[] key) {
        int len = key.length;
        if (len != 32) {
            throw new IllegalArgumentException("AES-256을 위한 32바이트 키가 필요합니다. 현재 길이: " + len);
        }
    }
}
