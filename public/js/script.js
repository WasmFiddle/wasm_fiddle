window.addEventListener('DOMContentLoaded', ()=>{
    goButton();
    copyCodeButton();
})

function copyCodeButton(){
    document.getElementById('copyBtn').addEventListener('click', ()=>{
        copyLink();
    })
} 

function copyLink() {
    // Code adapted from https://stackoverflow.com/questions/36639681/how-to-copy-text-from-a-div-to-clipboard
    var range = document.createRange();
    range.selectNode(document.getElementById("code-link"));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges();// to deselect
    alert("Code Copied");
  }

function goButton(){
    let goBtn = document.getElementById("go-btn");
    goBtn.addEventListener('click', ()=>{
        serveFile();
    });
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