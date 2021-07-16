/*
Much of this was inspired/copied from CSS-Tricks
https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
*/

// in case padding changes with window size
const leftPadding = Number(window.getComputedStyle(document.getElementById("editing"), null).getPropertyValue('padding-left').split('p')[0]);

document.addEventListener("DOMContentLoaded", () => {
    existingContent();
    langSelector();
    syncEditor();
    updateLang();
    goButton();
});

function langSelector(){
    document.getElementsByName("options").forEach(element => {
        element.addEventListener('click', ()=>{updateLang(element.value)})
    });
}

function updateLang(selectedLang){
    let preBlock = document.getElementById("highlighting");
    let codeBlock = document.getElementById("highlighting-content");

    let lang = selectedLang == 'rust' ? 'rust' : 'clike';
    preBlock.className = `language-${lang}`;
    codeBlock.className = `language-${lang}`;
    existingContent();
}

function syncEditor(){
    const textArea = document.getElementById("editing");
    textArea.addEventListener('keydown', (event) => {
        checkTab(textArea, event);
        autoIndent(textArea, event);
    });
    textArea.addEventListener('scroll', () => {
        syncScroll(textArea);
        updateMargin(textArea);
    });
    textArea.addEventListener('input', (event) => {
        update(textArea.value);
        syncScroll(textArea);
    });
    textArea.addEventListener('keyup', (event)=>{
        bracketQuote(textArea, event);
    })
}

function existingContent(){
    update(document.getElementById("editing").value);
}

// use this to update the highlighting
function update(text){
    let resultElement = document.getElementById("highlighting-content");
    if(text[text.length-1] == "\n" || text.length == 0) text += " "; // add placeholder space
    resultElement.innerHTML = text.replace(new RegExp("&", "g"), "&").replace(new RegExp("<", "g"), "<"); /* Global RegExp */
    Prism.highlightElement(resultElement);
}

function cursorPlacement(element, placement){
    element.selectionEnd = placement;
    element.selectionStart = placement;
}

function closeBracketQuote(element, event){
    let closing;
    let code = element.value;
    let newChar = event.key;
    if ('([{"\''.includes(newChar))
    {
        let before = code.slice(0, element.selectionStart); // text before tab
        let after = code.slice(element.selectionEnd, element.value.length); // text after tab
        let cursorPos = element.selectionEnd; // move to next place

        switch (newChar){
            case '(':
                closing = ')';
                break;
            case '[':
                closing = ']';
                break;
            case '{':
                closing = '}';
                break;
            case '"':
                closing = '"';
                break;
            case "'":
                closing = "'";
                break;
        }

        element.value = before+closing+after;
        cursorPlacement(element, cursorPos);
    }
}

function bracketQuote(element, event){
    let next = element.value[element.selectionStart];
    let code = element.value;
    let newChar = event.key
    if (')]}\'"'.includes(newChar) && next == newChar){
        let before = code.slice(0, element.selectionStart); // text before insert
        let after = code.slice(element.selectionEnd + 1); // text after
        let cursorPos = element.selectionEnd; // move to next place
        element.value = before+after;
        cursorPlacement(element, cursorPos);
    } else {
        closeBracketQuote(element, event);

    }

    update(element.value);
}

function syncScroll(element){
    document.getElementById("highlighting").scrollTop = element.scrollTop;
    document.getElementById("highlighting").scrollLeft = element.scrollLeft;
}

// avoids misalignment when scrolling outside of editor width
function updateMargin(editArea){
    let lPad = leftPadding - editArea.scrollLeft;
    lPad = lPad > 0 ? lPad : 0;
    editArea.style.paddingLeft = `${lPad}px`;
    document.getElementById("highlighting").style.paddingLeft = `${lPad}px`;

}

// inserts a Tab of spaces
function checkTab(element, event) {
    let code = element.value;
    if(event.key == "Tab") {
        /* Tab key pressed */
        event.preventDefault(); // stop normal
        let beforeTab = code.slice(0, element.selectionStart); // text before tab
        let afterTab = code.slice(element.selectionEnd, element.value.length); // text after tab
        let cursorPos = element.selectionEnd + 4; // where cursor moves after tab - 4 for 4 spaces
        element.value = beforeTab + "    " + afterTab; // add tab char - 4 spaces
        // move cursor
        cursorPlacement(element, cursorPos);
        update(element.value); // Update text to include indent
    }
}

function autoIndent(element, event){
    if (event.key == 'Enter') {
        event.preventDefault();
        let code = element.value;
        let cursorPos = element.selectionStart; 

        // figure out how many spaces start the line
        let lineText = code.slice(0, element.selectionStart);
        lineText = lineText.slice(lineText.lastIndexOf('\n')+1, element.selectionStart).split('');
        // count the spaces
        let spaces = 0;
        for(let i=0; i<lineText.length; i++){
            if(lineText[i] === ' ') spaces++; 
            else break;
        }
        
        let before = code.slice(0, element.selectionStart); 
        let after = code.slice(element.selectionEnd);
        element.value = before + '\n' + (' '.repeat(spaces)) + after;
        cursorPlacement(element, cursorPos + spaces + 1);
        update(element.value);
    }
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
            fileType = element.value == 'rust' ? 'rust' : 'cpp';
    });

    let download = document.createElement('a');
    download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sourceFile));
    download.setAttribute('download',  `main.${fileType}`);

    download.style.display = 'none';
    document.body.appendChild(download);

    download.click();
    document.body.removeChild(download);
}