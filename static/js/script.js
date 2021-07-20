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
    sendFile();
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

function sendFile() {
  const sourceText = document.getElementById('editing').value;
  let fileType;
  document.getElementsByName('options').forEach((element) => {
    if (element.checked) fileType = element.value == 'rust' ? 'rs' : 'cpp';
  });

  var sourceFile = new File([sourceText], `main.${fileType}`, {
    type: 'text/plain',
  });

  console.log(sourceFile);
;
  var fileData = new FormData();
  fileData.append('file', sourceFile);
  fileData.append('filetype', `${fileType}`);
  

  //This will need to be modified for production
  fetch('/compile', {
    method: 'POST',
    body: fileData
  });
}