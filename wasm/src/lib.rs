use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn e() -> String {
    let js = r#"
        console.log("Hello from generated JS!");
    "#;

    js.to_string()
}
