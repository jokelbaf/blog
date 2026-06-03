use aes::cipher::{
    BlockCipherDecrypt, BlockCipherEncrypt, KeyInit,
    block_padding::{Padding, Pkcs7},
};
use aes::{Aes256, Block as AesBlock};
use thiserror::Error;

const BLOCK_SIZE: usize = 16;
const JS_OBFUSCATION_KEY: [u8; 16] = [
    0x6d, 0x31, 0xc7, 0x94, 0x52, 0x0f, 0xa8, 0xe3, 0x19, 0xbb, 0x74, 0x2d, 0x80, 0x46, 0xd5, 0x0a,
];

#[derive(Debug, Error)]
pub enum CryptoError {
    #[error("ciphertext length {len} is not a multiple of the AES block size {block_size}")]
    InvalidCiphertextLength { len: usize, block_size: usize },

    #[error("ciphertext must contain at least one block")]
    EmptyCiphertext,

    #[error("internal block length mismatch: expected {expected}, got {actual}")]
    InvalidBlockLength { expected: usize, actual: usize },

    #[error("invalid PKCS#7 padding")]
    InvalidPadding,
}

pub type Result<T> = std::result::Result<T, CryptoError>;

pub fn encrypt_pkcs7(key: &[u8; 32], data: &[u8]) -> Result<Vec<u8>> {
    let padded_len = (data.len() / BLOCK_SIZE + 1) * BLOCK_SIZE;
    let mut buf = vec![0u8; padded_len];

    buf[..data.len()].copy_from_slice(data);

    Pkcs7::raw_pad(&mut buf[padded_len - BLOCK_SIZE..], data.len() % BLOCK_SIZE);

    let cipher = Aes256::new(key.into());

    for block in buf.chunks_exact_mut(BLOCK_SIZE) {
        cipher.encrypt_block(block_mut(block)?);
    }

    Ok(buf)
}

pub fn decrypt_pkcs7(key: &[u8; 32], data: &mut Vec<u8>) -> Result<()> {
    if !data.len().is_multiple_of(BLOCK_SIZE) {
        return Err(CryptoError::InvalidCiphertextLength {
            len: data.len(),
            block_size: BLOCK_SIZE,
        });
    }

    let cipher = Aes256::new(key.into());
    for block in data.chunks_exact_mut(BLOCK_SIZE) {
        cipher.decrypt_block(block_mut(block)?);
    }

    let last_block_start = data
        .len()
        .checked_sub(BLOCK_SIZE)
        .ok_or(CryptoError::EmptyCiphertext)?;
    let last_block = &data[last_block_start..];
    let unpadded_len = Pkcs7::raw_unpad(last_block)
        .map_err(|_| CryptoError::InvalidPadding)?
        .len();

    data.truncate(last_block_start + unpadded_len);
    Ok(())
}

fn block_mut(block: &mut [u8]) -> Result<&mut AesBlock> {
    let actual = block.len();
    <&mut AesBlock>::try_from(block).map_err(|_| CryptoError::InvalidBlockLength {
        expected: BLOCK_SIZE,
        actual,
    })
}

pub fn obfuscate_js(js: impl AsRef<str>) -> String {
    let bytes = js.as_ref().as_bytes();
    let mut obfuscated = String::with_capacity(bytes.len() * 2);

    for (i, &byte) in bytes.iter().enumerate() {
        let byte = obfuscate_js_byte(byte, i, bytes.len());
        obfuscated.push(hex_digit(byte >> 4));
        obfuscated.push(hex_digit(byte & 0x0f));
    }

    obfuscated
}

fn obfuscate_js_byte(byte: u8, index: usize, len: usize) -> u8 {
    let key = JS_OBFUSCATION_KEY[index % JS_OBFUSCATION_KEY.len()];
    let shift = (index as u32 % 7) + 1;
    let offset = (index as u8).wrapping_mul(31).wrapping_add(17);
    let mask = (len as u8).wrapping_add(index as u8).rotate_left(3);

    (byte ^ key).rotate_left(shift).wrapping_add(offset) ^ mask
}

fn hex_digit(nibble: u8) -> char {
    b"0123456789abcdef"[usize::from(nibble & 0x0f)] as char
}
