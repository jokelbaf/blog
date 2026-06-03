use std::{env, fs, path::PathBuf};

fn main() {
    println!("cargo:rerun-if-changed=build/script.obfuscated.js");

    let build_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("build");
    fs::create_dir_all(&build_dir).unwrap();

    let source = fs::read_to_string("build/script.obfuscated.js").unwrap();
    let obfuscated = crypto::obfuscate_js(source);

    fs::write(build_dir.join("output.bin"), obfuscated).unwrap();
}
