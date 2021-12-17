let scriptpreset = `
let inputarray = Array.from(document.getElementById('crossword').children);
let globalsidelen = inputarray[inputarray.length-1].position;
let data = "%%DATA%%";

function highlight(e) {
  e.classList.add('highlight');
}

function unhighlight(e) {
  e.classList.remove('highlight');
}

function checkAnswers(){
  let res = Array.from(document.getElementById('crossword').children)
    .filter(e => e.tagName === "INPUT")
    .map(e => e.classList.contains('block') ? "-" : (e.value || " "))
    .join("");
  if(res === data) document.getElementById('checkbutton').innerText = "Congrats! You've solved it!"
  else {
    document.getElementById('checkbutton').innerText = "There's a mistake somewhere, try again!";
    
    setTimeout(() => {
      document.getElementById("checkbutton").innerText = "Check Answers"
    }, 5e3);
  }
}

const keymap = {
  "ArrowUp": n => n - globalsidelen,
  "ArrowDown": n => n + globalsidelen,
  "ArrowLeft": n => n - 1,
  "ArrowRight": n => n + 1
};

function changeFocus(elem, newPos) {
  Array.from(elem.parentElement.children).find(el => el.getAttribute('position') === \`\${newPos}\`).focus();
}

function movementEventListener(e){
  let focusedElem = document.getElementsByClassName('highlight')[0];
  if (!focusedElem) return;
  let focusedElemPos = parseInt(focusedElem.getAttribute('position'));

  //Make input clear itself on new key press
  if (\`\${e.key}\`.length === 1 && \`\${e.key}\`.match(/[A-Z]/i).length) {
    focusedElem.value = \`\${e.key}\`;
  }

  //Delete input when prompted
  if ("Backspace" === e.key) focusedElem.value = "";

  //Handle Arrow key movements
  if (e.keyCode > 36 && e.keyCode < 41) {
    let newPos = keymap[e.key](focusedElemPos);

    if (newPos < 1 || newPos > (globalsidelen * globalsidelen)) return;

    changeFocus(focusedElem, newPos);
  }
}

document.getElementById('crossword').addEventListener('keydown', movementEventListener);
`.trim();

let csspreset = `
.cwinput {
  width: 50px;
  height: 50px;
  font-size: 40px;
  border: 1px 0.25px 0.25px 0.25px;
  border-color: black;
  outline: none;
  text-align: center;
  caret-color: transparent;
  text-transform:uppercase;
}

.block {
  background-color: black;
}

.number {
  position: absolute;
  padding-left: 3px;
}

#crossword {
  border-top-width: 1px;
  border-left-width: 1px;
  border-right-width: 1px;
  border-bottom-width: 1px;
  border-color: black;
}

.highlight {
  background-color: #9ed7ff;
}
`.trim().replace(/[ \n]/g, "");

function highlight(e) {
  e.classList.add('highlight');
}

function unhighlight(e) {
  e.classList.remove('highlight');
}

let globalsidelen; //This is a wonderful idea.

function generateDemoCrossword(sidelen) {
  sidelen = parseInt(sidelen);
  globalsidelen = sidelen;
  const parent = document.getElementById('demodata');
  parent.innerHTML = "";

  let nvit = 0;
  for (let i = 1; i < (sidelen * sidelen) + 1; i++) {
    let elem = document.createElement('input');
      elem.classList.add('cwinput')
      elem.setAttribute('maxlength', 1);
      elem.setAttribute('onfocus', 'highlight(this)');
      elem.setAttribute('onfocusout', 'unhighlight(this)');
      elem.setAttribute('position', i);
      
    parent.appendChild(elem.cloneNode());

    if (Math.floor(i / sidelen) === i / sidelen) parent.appendChild(document.createElement('br'));
  }
  document.getElementById('demonums').innerHTML = parent.innerHTML;
  
  parent.innerHTML = "<p>Letters: Insert the correct answers for the puzzle. Put a \"-\" if you would like to insert a black square</p>" + parent.innerHTML;
  document.getElementById('demonums').innerHTML = "<p>Numbers: Insert any value into a square and a corresponding number will be rendered in its top left corner.</p>" + document.getElementById('demonums').innerHTML + `<button onclick = "extractData()">Create Crossword!</button>`
}

function extractData(){
  let data = checkAnswers('demodata');
  if(data.includes(" ")) return;
  let numvals = Array.from(document.getElementById('demonums').children)
    .filter(e => e.tagName === "INPUT")
    .map((e,i,a) => e.value !== "" ? a.indexOf(e) + 1 : "")
    .filter(e => e !== "");
  generateCrossword(globalsidelen, data, numvals)
}

function generateCrossword(sidelen, data, numvals) {
  sidelen = parseInt(sidelen);
  const parent = document.getElementById('crossword');
  parent.innerHTML = "";

  let nvit = 0;
  for (let i = 1; i < (sidelen * sidelen) + 1; i++) {
    let elem;
    if(data[i-1] === "-"){
      elem = document.createElement('input');
      elem.classList.add('cwinput', 'block');
    } else {
      elem = document.createElement('input');
      elem.classList.add('cwinput')
      elem.setAttribute('maxlength', 1);
      elem.setAttribute('onfocus', 'highlight(this)');
      elem.setAttribute('onfocusout', 'unhighlight(this)');
      elem.setAttribute('position', i);
    }
    
    if(numvals[nvit] === i){
      let numelem = document.createElement('span')
      numelem.classList.add('number')
      numelem.textContent = `${nvit+1}`;
      nvit++;
      parent.appendChild(numelem.cloneNode(true))
    }

    parent.appendChild(elem.cloneNode());

    if (Math.floor(i / sidelen) === i / sidelen) parent.appendChild(document.createElement('br'));
  }

  let checkbutton = document.createElement('button');
  checkbutton.setAttribute('id', "checkbutton");
  checkbutton.setAttribute('onclick', 'checkAnswers()');
  parent.appendChild(checkbutton.cloneNode());
  parent.lastChild.appendChild(document.createTextNode("Check Answers"))

  let htmlpreset = parent.innerHTML;
  parent.innerHTML = `Demo (note: the "Check Answers" button will not work in the demo):<br>
  ${parent.innerHTML}<br>
  HTML: <textarea rows="20" cols="40"><div id= "crossword">${parent.innerHTML}</div></textarea>
  CSS: <textarea rows="20" cols="40">${csspreset}</textarea>
  JS: <textarea rows="20" cols="40">${scriptpreset.replace("%%DATA%%", data)}</textarea>`
}

//Iterate through input blocks and check values.
function checkAnswers(id){
  let res = Array.from(document.getElementById(id).children)
    .filter(e => e.tagName === "INPUT")
    .map(e => e.classList.contains('block') ? "-" : (e.value || " "))
    .join("");
  return res;
}

//Manage key events
const keymap = {
  "ArrowUp": n => n - globalsidelen,
  "ArrowDown": n => n + globalsidelen,
  "ArrowLeft": n => n - 1,
  "ArrowRight": n => n + 1
};

function changeFocus(elem, newPos) {
  Array.from(elem.parentElement.children).find(el => el.getAttribute('position') === `${newPos}`).focus();
}

function movementEventListener(e){
  let focusedElem = document.getElementsByClassName('highlight')[0];
  if (!focusedElem) return;
  let focusedElemPos = parseInt(focusedElem.getAttribute('position'));

  //Make input clear itself on new key press
  if (`${e.key}`.length === 1 && `${e.key}`.match(/[A-Z]/i).length) {
    focusedElem.value = `${e.key}`;
  }

  //Delete input when prompted
  if ("Backspace" === e.key) focusedElem.value = "";

  //Handle Arrow key movements
  if (e.keyCode > 36 && e.keyCode < 41) {
    let newPos = keymap[e.key](focusedElemPos);

    if (newPos < 1 || newPos > (globalsidelen * globalsidelen)) return;

    changeFocus(focusedElem, newPos);
  }
}

document.getElementById('crossword').addEventListener('keydown', movementEventListener);
document.getElementById('demodata').addEventListener('keydown', movementEventListener);
document.getElementById('demonums').addEventListener('keydown', movementEventListener);