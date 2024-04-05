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
  letter = event.getModifierState("CapsLock") ? "Ö" : "ö";
  insertCharacter(letter);
}

function btnUUClicked() {
  letter = event.getModifierState("CapsLock") ? "Ü" : "ü";
  insertCharacter(letter);
}

function btnEEClicked() {
  letter = event.getModifierState("CapsLock") ? "Ë" : "ë";
  insertCharacter(letter);
}

// v2.0 Optimized
// More convenient way to directly through keyboard with `Shift` enhanced
var altKeyPressed = false;

document.addEventListener("keydown", function (event) {
  var key = event.key.toLowerCase();
  var letter = "";

  if (event.key === "Alt") {
    altKeyPressed = true;
  } else if (altKeyPressed) {
    if (key === "o") {
      letter = event.getModifierState("CapsLock") ? "Ö" : "ö";
    } else if (key === "u") {
      letter = event.getModifierState("CapsLock") ? "Ü" : "ü";
    } else if (key === "e") {
      letter = event.getModifierState("CapsLock") ? "Ë" : "ë";
    }

    if (letter !== "") {
      event.preventDefault(); // Prevent the default input
      insertLetterAtCursor(letter); // Insert the letter at the current cursor position
    }
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "Alt") {
    altKeyPressed = false;
  }
});

// Function to insert text at the current cursor position in an input or textarea element
function insertLetterAtCursor(text) {
  var element = document.activeElement;
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    var startPos = element.selectionStart;
    var endPos = element.selectionEnd;
    element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
    element.selectionStart = element.selectionEnd = startPos + text.length;
  }
}
