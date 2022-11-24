fetch("../target/wasm32-unknown-unknown/release/rust_from_js.wasm")
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.instantiate(bytes, { env: {} }))
  .then((results) => {
    let module = {};
    let mod = results.instance;
    module.add = mod.exports.add;

    const lhsElem = document.getElementById("lhs");
    const rhsElem = document.getElementById("rhs");
    const answerElem = document.getElementById("answer");

    function recalculate() {
      const lhs = parseInt(lhsElem.value);
      const rhs = parseInt(rhsElem.value);

      if (lhs == NaN || rhs == NaN) return (answerElem.innerHTML = "?");

      // Actually call the `add` function
      answerElem.innerHTML = module.add(lhs, rhs);
    }

    lhsElem.addEventListener("input", recalculate);
    rhsElem.addEventListener("input", recalculate);

    recalculate();
  });