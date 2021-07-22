window.addEventListener('DOMContentLoaded', ()=>{
    embedButton();
    goButton();
})

function embedButton(){
    document.getElementById('btn-embed').addEventListener('click', ()=>{
        embedFiddle();
    })
}

function embedFiddle(){
    alert('Embed some stuff!')
}

function goButton(){
    // let goBtn = document.getElementById("go-btn");
    // goBtn.addEventListener('click', ()=>{
        // serveFile();
    // });
    // makeWasmFile('../../squarer.wasm');
}

function serveFile(){
    const sourceFile = document.getElementById("editing").value;
    let fileType;
    document.getElementsByName("options").forEach(element => {
        if (element.checked) 
            fileType = element.value == 'rust' ? 'rs' : 'cpp';
    });

    let download = document.createElement('a');
    download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sourceFile));
    download.setAttribute('download',  `main.${fileType}`);

    download.style.display = 'none';
    document.body.appendChild(download);

    download.click();
    document.body.removeChild(download);
}

async function makeWasmFile(wasmFile){
    await fetch(wasmFile)
        .then(response => response.arrayBuffer())
        .then(buffer => WebAssembly.compile(buffer))
        .then(module => {
            const instance = new WebAssembly.Instance(module);
            console.log(instance.exports.squarer());
        });
}

makeWasmFile('squarer.wasm');

var squarer = () => {};

// function loadWebAssembly(fileName) {
//   return fetch(fileName)
//     .then(response => response.arrayBuffer())
//     .then(buffer => WebAssembly.compile(buffer))
//     .then(module => {return new WebAssembly.Instance(module) });
// };
  
// loadWebAssembly('squarer.wasm')
//   .then(instance => {
//     wasmBin = instance.exports._Z7squareri;
//     console.log('Finished compiling! Ready when you are...');
//   }); 