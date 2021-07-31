

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
    //sendFile();
    sendRunSource();
  });
}


function sendRunSource() {
    let fileData= packageSource();

    var importObject = {
        imports: { imported_func: arg => console.log(arg) }
      };
    
      //This will need to be modified for production
      fetch('/data', {
          method: 'POST',
          body: fileData
      }).then((response) => {
          return response.json();
      }).then((data) =>{
          console.log(data);
          if(data.error){
            document.getElementById('output').innerHTML = data.error;
          }
          else {
          WebAssembly.instantiateStreaming(fetch(`/file/${data.wrkdir}`), importObject).then(obj => {
            document.getElementById('output').innerHTML = obj.instance.exports.main();
             console.log(obj.instance.exports.main())});
          }

      }).catch(err=>console.log(err));
  }


// IGNORE THIS SECTION IT WAS ALL TESTING

/* function serveFile() {
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
} */

/* function sendFile() {
  const sourceText = document.getElementById('editing').value;
  let fileType;
  document.getElementsByName('options').forEach((element) => {
    if (element.checked) fileType = element.value == 'rust' ? 'rs' : 'cpp';
  });

  var sourceFile = new File([sourceText], `main.${fileType}`, {
    type: 'text/plain',
  });

  //console.log(sourceFile);
;
  var fileData = new FormData();
  fileData.append('file', sourceFile);
  fileData.append('filetype', `${fileType}`);
  
  var importObject = {
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

  //This will need to be modified for production
  fetch('http://localhost:8080/data', {
    method: 'POST',
    body: fileData
  }).then(response => {
    console.log(response);
    WebAssembly.instantiateStreaming(fetch('file'), importObject)
    .then(results => {
        console.log("RES: " + results)
  // Do something with the results!
}).catch(err =>{console.log(err)});
});
} */



  
  /* async function runWasm(wasmFile){
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
      imports: {
        memory: wasmMemory
      }
    }
  
    let buffer = await wasmFile.arrayBuffer(); 
    WebAssembly.compile(buffer)
      .then(module => WebAssembly.instantiate(module, importObject))
      .then(wasmInstance => {
        console.log(wasmInstance.exports);
        // const aBuffer = wasmMemory.buffer;
        // const newBuffer = new Uint8Array(aBuffer);
        // console.log(newBuffer)
        writeOutput(wasmInstance.exports.main());
      })
  } */

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