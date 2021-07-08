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
});

function langSelector(){
    let menu = document.getElementById("selected-lang");
    menu.addEventListener('change', updateLang);
}

function updateLang(){
    let selection = document.getElementById("selected-lang");
    let preBlock = document.getElementById("highlighting");
    let codeBlock = document.getElementById("highlighting-content");

    let lang = selection.value == 'rust' ? 'rust' : 'clike';

    preBlock.className = `language-${lang}`;
    codeBlock.className = `language-${lang}`;
    existingContent();
}

function syncEditor(){
    const textArea = document.getElementById("editing");
    textArea.addEventListener('keydown', (event) => {
        checkTab(textArea, event);
    });
    textArea.addEventListener('scroll', () => {
        syncScroll(textArea);
        updateMargin(textArea);
    });
    textArea.addEventListener('input', () => {
        update(textArea.value);
        syncScroll(textArea);
    });
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
        element.selectionStart = cursorPos;
        element.selectionEnd = cursorPos;
        update(element.value); // Update text to include indent
    }
}