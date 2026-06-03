use thiserror::Error;
use wasm_bindgen::prelude::*;
use wasm_macros::include_encrypted;

#[derive(Debug, Error)]
pub enum ModuleError {
    #[error("crypto error: {0}")]
    Crypto(#[from] crypto::CryptoError),

    #[error("embedded payload is not valid UTF-8: {0}")]
    Utf8(#[from] std::string::FromUtf8Error),
}

#[inline(always)]
fn lcg_byte(state: &mut u64) -> u8 {
    *state = state
        .wrapping_mul(6364136223846793005)
        .wrapping_add(1442695040888963407);
    (*state >> 56) as u8
}

#[inline(never)]
pub fn decrypt_embedded(
    obf_key: &[u8; 32],
    vm_prog: &[u8],
    obf_data: &[u8],
    lcg_s1: u64,
    rot_table: &[u8; 8],
    lcg_s2: u64,
) -> Result<String, ModuleError> {
    let mut key = [0u8; 32];
    for (i, b) in obf_key.iter().enumerate() {
        key[i] = unsafe { std::ptr::read_volatile(b) };
    }

    for instr in vm_prog.chunks_exact(3) {
        let op = unsafe { std::ptr::read_volatile(&instr[0]) };
        let a = unsafe { std::ptr::read_volatile(&instr[1]) } as usize;
        let b = unsafe { std::ptr::read_volatile(&instr[2]) };
        match op {
            1 => key[a] ^= b,
            2 => key[a] = key[a].rotate_left(b as u32),
            3 => key[a] = key[a].rotate_right(b as u32),
            4 => key.swap(a, b as usize),
            5 => key[a] = key[a].wrapping_add(b),
            6 => key[a] = key[a].wrapping_sub(b),
            _ => {}
        }
    }

    let mut data: Vec<u8> = obf_data
        .iter()
        .map(|b| unsafe { std::ptr::read_volatile(b) })
        .collect();

    let mut s2 = unsafe { std::ptr::read_volatile(&lcg_s2) };
    for (i, b) in data.iter_mut().enumerate() {
        *b = b.wrapping_sub(lcg_byte(&mut s2) ^ (i as u8));
    }

    for (i, b) in data.iter_mut().enumerate() {
        *b = b.rotate_right(rot_table[i % 8] as u32);
    }

    let mut s1 = unsafe { std::ptr::read_volatile(&lcg_s1) };
    for b in data.iter_mut() {
        *b ^= lcg_byte(&mut s1);
    }

    let result = crypto::decrypt_pkcs7(&key, &mut data)
        .map_err(ModuleError::from)
        .and_then(|()| String::from_utf8(data).map_err(ModuleError::from));

    for b in key.iter_mut() {
        unsafe { std::ptr::write_volatile(b, 0) };
    }

    result
}

#[wasm_bindgen]
pub fn e() -> Result<String, JsError> {
    include_encrypted!("build/output.bin").map_err(|err| JsError::new(&err.to_string()))
}
