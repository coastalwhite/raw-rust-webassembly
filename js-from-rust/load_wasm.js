const outputElem = document.getElementById("output");

function append_display_i32(i) {
  outputElem.innerHTML += `${i}, `;
}

fetch("../target/wasm32-unknown-unknown/release/js_from_rust.wasm")
  .then((response) => response.arrayBuffer())
  .then((bytes) =>
    WebAssembly.instantiate(bytes, { env: { append_display_i32 } })
  )
  .then((results) => {
    let module = {};
    let mod = results.instance;
    module.display_primes = mod.exports.display_primes;

    module.display_primes();
  });