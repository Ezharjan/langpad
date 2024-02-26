function insertCharacter(character) {
  console.log(character + " is clicked!");
  var textarea = document.getElementById("note");
  var cursorPos = textarea.selectionStart;
  var text = textarea.value;
  var newText = text.slice(0, cursorPos) + character + text.slice(cursorPos);
  textarea.value = newText;
  textarea.selectionStart = cursorPos + 1;
  textarea.selectionEnd = cursorPos + 1;
  textarea.focus();
}

function btnOOClicked() {
  insertCharacter("ö");
}

function btnUUClicked() {
  insertCharacter("ü");
}

function btnEEClicked() {
  insertCharacter("ë");
}
