window.addEventListener('DOMContentLoaded', () => {
  embedButton();
  goButton();
});

function embedButton() {
  document.getElementById('btn-embed').addEventListener('click', () => {
    embedFiddle();
  });
}

function embedFiddle() {
  alert('Embed some stuff!');
}

function goButton() {
  let goBtn = document.getElementById('go-btn');
  goBtn.addEventListener('click', () => {
    sendRunSource();
  });
}

function serveFile() {
  const sourceFile = document.getElementById('editing').value;
  let fileType;
  document.getElementsByName('options').forEach((element) => {
    if (element.checked) fileType = element.value == 'rust' ? 'rs' : 'cpp';
  });

  let download = document.createElement('a');
  download.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(sourceFile)
  );
  download.setAttribute('download', `main.${fileType}`);

  download.style.display = 'none';
  document.body.appendChild(download);

  download.click();
  document.body.removeChild(download);
}

function packageSource(){
  const sourceText = document.getElementById('editing').value;
  let fileType;
  document.getElementsByName('options').forEach((element) => {
    if (element.checked) fileType = element.value == 'rust' ? 'rs' : 'cpp';
  });

  var sourceFile = new File([sourceText], `main.${fileType}`, {
    type: 'text/plain',
  });
  // console.log(sourceFile);

  var fileData = new FormData();
  fileData.append('file', sourceFile);
  fileData.append('filetype', `${fileType}`);

  return fileData;
}

function sendRunSource() {
  let fileData= packageSource()
	document.getElementById("output").innerHTML = 'Please wait while your code compiles...';
	//This will need to be modified for production
	fetch('/compile', {
		method: 'POST',
		body: fileData
	}).then(res=>{
		return res.text();
	}).then((js) => {
		let myScript = document.getElementById("wasmScript");
		myScript.innerHTML = js;
	})
	.catch(err=>console.log(err));
}

async function runWasm(wasmFile){
  // needed to instantiate sent file
  let wasmMemory = new WebAssembly.Memory({initial: 2});
  let importObject = {
    wasi_snapshot_preview1: {
      'args_sizes_get': ()=>{},
      'args_get': ()=>{},
      'proc_exit': ()=>{},
      'fd_write': ()=>{}
    }, 
    env: { 
      'main': ()=>{}, 
    }, 
  }

  let buffer = await wasmFile.arrayBuffer(); 
  WebAssembly.compile(buffer)
    .then(module => WebAssembly.instantiate(module, importObject))
    .then(wasmInstance => {
      console.log(wasmInstance.exports);
      writeOutput(wasmInstance.exports.main());
    })
}

async function writeHtml(htmlFile) {
	let buffer = await htmlFile.arrayBuffer(); 
	var enc = new TextDecoder("utf-8");
	writeOutput(enc.decode(buffer));
}

function writeOutput(toWrite){
  const outBox = document.getElementById("output");
  outBox.innerHTML = toWrite;
}