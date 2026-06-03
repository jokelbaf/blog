use proc_macro::TokenStream;
use proc_macro2::Literal;
use quote::quote;
use syn::LitStr;
use thiserror::Error;

const OP_XOR: u8 = 1;
const OP_ROT_L: u8 = 2;
const OP_ROT_R: u8 = 3;
const OP_SWAP: u8 = 4;
const OP_ADD: u8 = 5;
const OP_SUB: u8 = 6;

#[derive(Debug, Error)]
enum MacroError {
    #[error("CARGO_MANIFEST_DIR is not set")]
    MissingManifestDir(#[source] std::env::VarError),

    #[error("path contains invalid UTF-8: {}", path.display())]
    NonUtf8Path { path: std::path::PathBuf },

    #[error("failed to read '{}'", path.display())]
    ReadFile {
        path: std::path::PathBuf,
        #[source]
        source: std::io::Error,
    },

    #[error("file '{}' is not valid UTF-8", path.display())]
    InvalidUtf8 {
        path: std::path::PathBuf,
        #[source]
        source: std::str::Utf8Error,
    },

    #[error("random source failed: {0}")]
    Random(#[from] getrandom::Error),

    #[error("invalid random byte length: expected {expected}, got {actual}")]
    InvalidRandomBytes { expected: usize, actual: usize },

    #[error("crypto error: {0}")]
    Crypto(#[from] crypto::CryptoError),
}

#[proc_macro]
pub fn include_encrypted(input: TokenStream) -> TokenStream {
    match run(input.into()) {
        Ok(ts) => ts.into(),
        Err(e) => e.to_compile_error().into(),
    }
}

fn run(input: proc_macro2::TokenStream) -> syn::Result<proc_macro2::TokenStream> {
    let path_lit: LitStr = syn::parse2(input)?;
    let span = path_lit.span();
    run_inner(path_lit).map_err(|err| syn::Error::new(span, err))
}

fn run_inner(path_lit: LitStr) -> Result<proc_macro2::TokenStream, MacroError> {
    let manifest_dir =
        std::env::var("CARGO_MANIFEST_DIR").map_err(MacroError::MissingManifestDir)?;

    let path = std::path::Path::new(&manifest_dir).join(path_lit.value());
    let abs_path = path
        .to_str()
        .ok_or_else(|| MacroError::NonUtf8Path { path: path.clone() })?
        .to_owned();

    let data = std::fs::read(&path).map_err(|source| MacroError::ReadFile {
        path: path.clone(),
        source,
    })?;

    std::str::from_utf8(&data).map_err(|source| MacroError::InvalidUtf8 {
        path: path.clone(),
        source,
    })?;

    let mut key = [0u8; 32];
    rand_fill(&mut key)?;

    let encrypted = crypto::encrypt_pkcs7(&key, &data)?;
    let (obf_key, vm_prog) = obfuscate_key(&key)?;
    let (obf_data, lcg_s1, rot_table, lcg_s2) = obfuscate_data(&encrypted)?;

    let ok = obf_key.to_vec();
    let vp = vm_prog.as_slice().to_vec();
    let od = obf_data.as_slice().to_vec();
    let rt = rot_table.to_vec();
    let s1 = Literal::u64_suffixed(lcg_s1);
    let s2 = Literal::u64_suffixed(lcg_s2);

    Ok(quote! {
        {
            const _: &[u8] = ::core::include_bytes!(#abs_path);
            const OBF_KEY:  [u8; 32] = [#(#ok),*];
            const VM_PROG:  &[u8]    = &[#(#vp),*];
            const OBF_DATA: &[u8]    = &[#(#od),*];
            const LCG_S1:   u64      = #s1;
            const ROT_TABLE:[u8; 8]  = [#(#rt),*];
            const LCG_S2:   u64      = #s2;
            crate::decrypt_embedded(&OBF_KEY, VM_PROG, OBF_DATA, LCG_S1, &ROT_TABLE, LCG_S2)
        }
    })
}

fn rand_fill(buf: &mut [u8]) -> Result<(), getrandom::Error> {
    getrandom::fill(buf)
}

fn lcg_next(state: &mut u64) -> u64 {
    *state = state
        .wrapping_mul(6364136223846793005)
        .wrapping_add(1442695040888963407);
    *state
}

fn lcg_byte(state: &mut u64) -> u8 {
    (lcg_next(state) >> 56) as u8
}

fn apply_op(buf: &mut [u8], op: u8, a: u8, b: u8) {
    match op {
        OP_XOR => buf[a as usize] ^= b,
        OP_ROT_L => buf[a as usize] = buf[a as usize].rotate_left(b as u32),
        OP_ROT_R => buf[a as usize] = buf[a as usize].rotate_right(b as u32),
        OP_SWAP => buf.swap(a as usize, b as usize),
        OP_ADD => buf[a as usize] = buf[a as usize].wrapping_add(b),
        OP_SUB => buf[a as usize] = buf[a as usize].wrapping_sub(b),
        _ => {}
    }
}

fn invert_op(op: u8) -> u8 {
    match op {
        OP_ROT_L => OP_ROT_R,
        OP_ROT_R => OP_ROT_L,
        OP_ADD => OP_SUB,
        OP_SUB => OP_ADD,
        _ => op,
    }
}

fn obfuscate_key(key: &[u8; 32]) -> Result<([u8; 32], Vec<u8>), MacroError> {
    const N: usize = 128;
    let mut rnd = vec![0u8; N * 3];
    rand_fill(&mut rnd)?;

    let mut ops: Vec<(u8, u8, u8)> = Vec::with_capacity(N);
    for i in 0..N {
        let op = (rnd[i * 3] % 6) + 1;
        let a = rnd[i * 3 + 1] % 32;
        let b = match op {
            OP_ROT_L | OP_ROT_R => (rnd[i * 3 + 2] % 7) + 1,
            OP_SWAP => {
                let c = rnd[i * 3 + 2] % 32;
                if c == a { (c + 1) % 32 } else { c }
            }
            _ => rnd[i * 3 + 2],
        };
        ops.push((op, a, b));
    }

    let mut obf = *key;
    for &(op, a, b) in &ops {
        apply_op(&mut obf, op, a, b);
    }

    let prog: Vec<u8> = ops
        .iter()
        .rev()
        .flat_map(|&(op, a, b)| [invert_op(op), a, b])
        .collect();

    Ok((obf, prog))
}

fn obfuscate_data(data: &[u8]) -> Result<(Vec<u8>, u64, [u8; 8], u64), MacroError> {
    let mut rnd = [0u8; 24];
    rand_fill(&mut rnd)?;

    let lcg_s1 =
        u64::from_le_bytes(
            rnd[0..8]
                .try_into()
                .map_err(|_| MacroError::InvalidRandomBytes {
                    expected: 8,
                    actual: rnd[0..8].len(),
                })?,
        );
    let lcg_s2 =
        u64::from_le_bytes(
            rnd[8..16]
                .try_into()
                .map_err(|_| MacroError::InvalidRandomBytes {
                    expected: 8,
                    actual: rnd[8..16].len(),
                })?,
        );
    let rot_table: [u8; 8] = std::array::from_fn(|i| (rnd[16 + i] % 7) + 1);

    let mut buf = data.to_vec();

    let mut s1 = lcg_s1;
    for b in &mut buf {
        *b ^= lcg_byte(&mut s1);
    }

    for (i, b) in buf.iter_mut().enumerate() {
        *b = b.rotate_left(rot_table[i % 8] as u32);
    }

    let mut s2 = lcg_s2;
    for (i, b) in buf.iter_mut().enumerate() {
        *b = b.wrapping_add(lcg_byte(&mut s2) ^ (i as u8));
    }

    Ok((buf, lcg_s1, rot_table, lcg_s2))
}
