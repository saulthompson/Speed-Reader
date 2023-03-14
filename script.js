const username = prompt('Please enter a username');




const textbox = document.querySelector('#textbox');
const speedSetting = document.querySelector('[name="speed"]');
const start = document.querySelector('[name="start"]');
const slower = document.querySelector('[name="decreaseSpeed"]');
const faster = document.querySelector('[name="increaseSpeed"]');

let textboxArray = textbox.value.split(' ');
let textObjs = {};


function wait(ms) {return new Promise(resolve => setTimeout(resolve, ms))};


function UserInput(text, initialSpeed) {
    this.text = text;
    this.initialSpeed = initialSpeed;
};

UserInput.prototype.saveText = function() {
    localStorage.setItem(this.username, this);
}

async function submitHandler() {
    
    if (!speedSetting.value) {
       const promptSpeed = prompt('please enter a speed (words per minute');
        speedSetting.value = promptSpeed;
    }

    if (textbox.value.match(/[\u4e00-\u9fff]/)) {
        let chineseTextArray = textbox.value.split('');

        console.log(chineseTextArray)
        chineseTextArray[0] === 'c' ? getRandomText(chineseTextArray.slice(6)) : processUserText(chineseTextArray)   
        return
    }

    const textboxArray = textbox.value.split(' ');
    textboxArray[0] === 'chat:' ? getRandomText(textboxArray) : processUserText(textboxArray);

}

async function getRandomText(textboxArray) {

    textboxArray.shift();
    textbox.value = 'ChatGPT is busy creating your text!';
    

    const randomText = await getChatGPTResponse(textboxArray.join(''));

    let randomTextArr;

    randomText.match(/[\u4e00-\u9fff]/g) ? randomTextArr = randomText.split('') :  randomTextArr = randomText.split(' ');

    textObjs[`${username}'s text`] = new UserInput(randomTextArr, speedSetting.value);

    

    calculateTiming(textObjs[`${username}'s text`])
}

function processUserText(textboxArray) {
    console.log('working')

    textObjs[`${username}'s text`] = new UserInput(textboxArray, speedSetting.value);

    textbox.value = null;

    speedSetting.classList.add('hidden');

    start.textContent = 'Refresh';
    start.removeEventListener('click', submitHandler);
    start.addEventListener('click', (e) => location.reload());

    document.querySelectorAll('.buttons').forEach(button => button.classList.add('animate'));

    calculateTiming(textObjs[`${username}'s text`])
}


function calculateTiming({text, initialSpeed}) {

    let timeToWait = (60000 / initialSpeed);





    renderArrItems(text, timeToWait, initialSpeed);

}

//bold first character
async function renderArrItems(array, timeToWait, initialSpeed) {
    
    textbox.value = null;
    slower.addEventListener('click', (e) => 
    {timeToWait = (60000 / (parseInt(speedDisplay.textContent) + 5)); 
        speedDisplay.textContent = `${parseInt(speedDisplay.textContent) - 5} words/min`});

    faster.addEventListener('click', (e) => 
{timeToWait = (60000 / (parseInt(speedDisplay.textContent) - 5));
     speedDisplay.textContent = `${parseInt(speedDisplay.textContent) + 5} words/min`;
     console.log(timeToWait)}
     );

    const speedDisplay = document.createElement('h2');
    speedDisplay.textContent = `${initialSpeed} words/min`;
    speedDisplay.classList.add('speedDisplay');
    document.querySelector('.buttons').insertAdjacentElement('afterend', speedDisplay);

    

    for (const item of array) {


        if (item.match(/[\u4e00-\u9fff]/)) {
            textbox.value += `${item}`; 
            console.log('chinese text rendering')
            selectWholeWord(textbox, item);

            await wait(timeToWait)
        } else {

        textbox.value += `${item} `;

        console.log(array)
        
        selectWholeWord(textbox, item);
       

        await wait(timeToWait)
        }
    
    }
    
}

let i = 0;
let prevTextboxNodeContainer;
const textboxNode = document.createTextNode(textbox.value);    


async function selectWholeWord(textbox, item) {
    i++;
    let startPos = textbox.selectionStart;
    let endPos = textbox.selectionEnd;
    let text = textbox.value;
  
    while (startPos > 0 && text.charAt(startPos + item.length) != " ") {
        console.log(startPos)
      startPos--;
    }
  
    while (endPos < text.length && text.charAt(endPos) != null) {
      endPos++;
    }
  
    textbox.focus();
    textbox.setSelectionRange(startPos, endPos);
  
    const selection = window.getSelection();
  
    if (prevTextboxNodeContainer) {
      document.body.removeChild(prevTextboxNodeContainer);
    }
  
    const textNodeContainer = document.createElement("div");
    textNodeContainer.classList.add('bold-div')
    let textboxNode = document.createTextNode(text);
    textNodeContainer.appendChild(textboxNode);
  
    if (i === 1) {
      document.body.removeChild(textbox);
    }
  
    document.body.insertAdjacentElement('afterbegin', textNodeContainer);
  
    ;
  
    const boldSpan = document.createElement("span");
    boldSpan.classList.add("bold");

    const range = document.createRange();
    range.setStart(textboxNode, startPos);
    range.setEnd(textboxNode, endPos)
    range.surroundContents(boldSpan);
  
    selection.removeAllRanges();
    
    await wait(50);
    prevTextboxNodeContainer = textNodeContainer;
  }



start.addEventListener('click', submitHandler)



const API_KEY = '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';
const API_URL = 'https://api.openai.com/v1/completions';

async function getChatGPTResponse(prompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
      
    },
    body: JSON.stringify({
        model: 'text-davinci-003',
      prompt,
      max_tokens: 500,
      n: 1,
      temperature: 0.2
          })
  });
  const data = await response.json();
  const answer = data.choices[0].text
  return answer
}

